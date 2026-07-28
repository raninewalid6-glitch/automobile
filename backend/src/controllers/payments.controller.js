import { query } from "../config/db.js";

const PAYMENT_METHODS = ["WAAFI", "DMONEY", "MASTERCARD", "CASH"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

// Paiement + infos sur la cible (réservation ou vente), le client et la voiture
const PAYMENT_SELECT = `
  SELECT pay.*,
         u.full_name AS payer_name, u.email AS payer_email, u.phone AS payer_phone,
         b.total_amount AS booking_total, bc.title AS booking_car,
         pu.price AS purchase_price, pc.title AS purchase_car
  FROM payments pay
  JOIN users u ON u.id = pay.user_id
  LEFT JOIN bookings b ON b.id = pay.booking_id
  LEFT JOIN cars bc ON bc.id = b.car_id
  LEFT JOIN purchases pu ON pu.id = pay.purchase_id
  LEFT JOIN cars pc ON pc.id = pu.car_id
`;

function toPayment(row) {
  const isBooking = row.booking_id != null;
  return {
    id: row.id,
    amount: row.amount,
    method: row.method,
    status: row.status,
    providerRef: row.provider_ref,
    note: row.note,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    client: { name: row.payer_name, email: row.payer_email, phone: row.payer_phone },
    target: {
      type: isBooking ? "booking" : "purchase",
      id: isBooking ? row.booking_id : row.purchase_id,
      car: isBooking ? row.booking_car : row.purchase_car,
      total: isBooking ? row.booking_total : row.purchase_price,
    },
  };
}

// Montant déjà payé (statut PAID) pour une réservation ou une vente
async function paidAmountFor(field, id) {
  const { rows } = await query(
    `SELECT COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0)::int AS paid
     FROM payments WHERE ${field} = $1`,
    [id]
  );
  return rows[0].paid;
}

// GET /api/admin/payments
export async function adminListPayments(_req, res, next) {
  try {
    const { rows } = await query(`${PAYMENT_SELECT} ORDER BY pay.created_at DESC`);
    res.json({ payments: rows.map(toPayment) });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/payments — enregistrer un paiement reçu (sur réservation OU vente)
export async function adminCreatePayment(req, res, next) {
  try {
    const { bookingId, purchaseId, amount, method, providerRef, note } = req.body || {};

    if (!method || !PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({ message: `Méthode invalide. Valeurs possibles : ${PAYMENT_METHODS.join(", ")}` });
    }
    if ((bookingId && purchaseId) || (!bookingId && !purchaseId)) {
      return res.status(400).json({ message: "Indique soit bookingId, soit purchaseId (un seul des deux)" });
    }

    // On récupère la cible pour connaître le client et le montant dû
    let target;
    if (bookingId) {
      const { rows } = await query("SELECT id, user_id, total_amount, status FROM bookings WHERE id = $1", [bookingId]);
      target = rows[0] && { userId: rows[0].user_id, total: rows[0].total_amount, status: rows[0].status };
    } else {
      const { rows } = await query("SELECT id, buyer_id, price, status FROM purchases WHERE id = $1", [purchaseId]);
      target = rows[0] && { userId: rows[0].buyer_id, total: rows[0].price, status: rows[0].status };
    }
    if (!target) {
      return res.status(404).json({ message: bookingId ? "Réservation introuvable" : "Demande d'achat introuvable" });
    }

    const alreadyPaid = await paidAmountFor(bookingId ? "booking_id" : "purchase_id", bookingId || purchaseId);
    const due = target.total - alreadyPaid;
    if (due <= 0) {
      return res.status(409).json({ message: "Cette opération est déjà entièrement payée" });
    }

    const paymentAmount = amount != null ? Number(amount) : due;
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: "Montant invalide" });
    }

    const { rows } = await query(
      `INSERT INTO payments (booking_id, purchase_id, user_id, amount, method, status, provider_ref, note, paid_at)
       VALUES ($1, $2, $3, $4, $5, 'PAID', $6, $7, now())
       RETURNING id`,
      [bookingId || null, purchaseId || null, target.userId, paymentAmount, method, providerRef || null, note || null]
    );

    // Si la réservation est maintenant entièrement payée, on la confirme automatiquement
    let bookingConfirmed = false;
    if (bookingId && alreadyPaid + paymentAmount >= target.total && ["PENDING", "PENDING_PAYMENT"].includes(target.status)) {
      await query("UPDATE bookings SET status = 'CONFIRMED' WHERE id = $1", [bookingId]);
      bookingConfirmed = true;
    }

    const { rows: full } = await query(`${PAYMENT_SELECT} WHERE pay.id = $1`, [rows[0].id]);
    res.status(201).json({ payment: toPayment(full[0]), bookingConfirmed });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/payments/:id/status — marquer payé / échoué / remboursé
export async function adminUpdatePaymentStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!PAYMENT_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Statut invalide. Valeurs possibles : ${PAYMENT_STATUSES.join(", ")}` });
    }

    const { rowCount } = await query(
      `UPDATE payments
       SET status = $1::payment_status,
           paid_at = CASE WHEN $1::text = 'PAID' THEN now() ELSE paid_at END
       WHERE id = $2`,
      [status, req.params.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: "Paiement introuvable" });
    }

    const { rows } = await query(`${PAYMENT_SELECT} WHERE pay.id = $1`, [req.params.id]);
    res.json({ payment: toPayment(rows[0]) });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------
// RECEIPTS (reçus numérotés)
// ------------------------------------------------------------

const RECEIPT_SELECT = `
  SELECT r.*,
         b.total_amount AS booking_total, bu.full_name AS booking_client, bc.title AS booking_car,
         pu.price AS purchase_price, puu.full_name AS purchase_client, pc.title AS purchase_car
  FROM receipts r
  LEFT JOIN bookings b ON b.id = r.booking_id
  LEFT JOIN users bu ON bu.id = b.user_id
  LEFT JOIN cars bc ON bc.id = b.car_id
  LEFT JOIN purchases pu ON pu.id = r.purchase_id
  LEFT JOIN users puu ON puu.id = pu.buyer_id
  LEFT JOIN cars pc ON pc.id = pu.car_id
`;

function toReceipt(row) {
  const isBooking = row.booking_id != null;
  return {
    id: row.id,
    receiptNumber: row.receipt_number,
    pdfUrl: row.pdf_url,
    issuedAt: row.issued_at,
    createdAt: row.created_at,
    target: {
      type: isBooking ? "booking" : "purchase",
      id: isBooking ? row.booking_id : row.purchase_id,
      client: isBooking ? row.booking_client : row.purchase_client,
      car: isBooking ? row.booking_car : row.purchase_car,
      amount: isBooking ? row.booking_total : row.purchase_price,
    },
  };
}

// GET /api/admin/receipts
export async function adminListReceipts(_req, res, next) {
  try {
    const { rows } = await query(`${RECEIPT_SELECT} ORDER BY r.created_at DESC`);
    res.json({ receipts: rows.map(toReceipt) });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/receipts — générer un reçu numéroté pour une réservation ou une vente
export async function adminCreateReceipt(req, res, next) {
  try {
    const { bookingId, purchaseId } = req.body || {};
    if ((bookingId && purchaseId) || (!bookingId && !purchaseId)) {
      return res.status(400).json({ message: "Indique soit bookingId, soit purchaseId (un seul des deux)" });
    }

    // Numéro du type REC-2026-00001
    const { rows: countRows } = await query("SELECT COUNT(*)::int AS n FROM receipts");
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(countRows[0].n + 1).padStart(5, "0")}`;

    const { rows } = await query(
      `INSERT INTO receipts (booking_id, purchase_id, receipt_number)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [bookingId || null, purchaseId || null, receiptNumber]
    );

    const { rows: full } = await query(`${RECEIPT_SELECT} WHERE r.id = $1`, [rows[0].id]);
    res.status(201).json({ receipt: toReceipt(full[0]) });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Un reçu existe déjà pour cette opération" });
    }
    if (err.code === "23503") {
      return res.status(404).json({ message: "Réservation ou demande d'achat introuvable" });
    }
    next(err);
  }
}
