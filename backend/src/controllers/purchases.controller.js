import { pool, query } from "../config/db.js";

const PURCHASE_STATUSES = ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"];

// Demande d'achat + infos voiture, acheteur et propriétaire
const PURCHASE_SELECT = `
  SELECT p.*,
         c.title AS car_title, c.brand AS car_brand, c.plate_number AS car_plate,
         c.city AS car_city, c.year AS car_year, c.mileage AS car_mileage,
         u.full_name AS buyer_name, u.email AS buyer_email, u.phone AS buyer_phone, u.city AS buyer_city,
         o.full_name AS owner_name, o.email AS owner_email, o.phone AS owner_phone,
         (SELECT ph.url FROM car_photos ph WHERE ph.car_id = c.id ORDER BY ph.position, ph.created_at LIMIT 1) AS car_image
  FROM purchases p
  JOIN cars c ON c.id = p.car_id
  JOIN users u ON u.id = p.buyer_id
  JOIN users o ON o.id = c.owner_id
`;

function toPurchase(row) {
  return {
    id: row.id,
    status: row.status,
    price: row.price,
    note: row.note,
    decidedAt: row.decided_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    car: {
      id: row.car_id,
      title: row.car_title,
      brand: row.car_brand,
      plateNumber: row.car_plate,
      city: row.car_city,
      year: row.car_year,
      mileage: row.car_mileage,
      image: row.car_image,
    },
    client: {
      id: row.buyer_id,
      name: row.buyer_name,
      email: row.buyer_email,
      phone: row.buyer_phone,
      city: row.buyer_city,
    },
    owner: {
      name: row.owner_name,
      email: row.owner_email,
      phone: row.owner_phone,
    },
  };
}

async function fetchPurchaseById(id) {
  const { rows } = await query(`${PURCHASE_SELECT} WHERE p.id = $1`, [id]);
  return rows[0] ? toPurchase(rows[0]) : null;
}

// POST /api/purchases — un client envoie une demande d'achat
export async function createPurchase(req, res, next) {
  try {
    const { carId, note } = req.body || {};
    if (!carId) {
      return res.status(400).json({ message: "carId est obligatoire" });
    }

    const { rows: carRows } = await query("SELECT * FROM cars WHERE id = $1", [carId]);
    const car = carRows[0];
    if (!car || car.status !== "ACTIVE" || !car.is_for_sale || car.sale_price == null) {
      return res.status(400).json({ message: "Cette voiture n'est pas disponible à la vente" });
    }

    const { rows: existing } = await query(
      `SELECT id FROM purchases
       WHERE car_id = $1 AND buyer_id = $2 AND status IN ('PENDING', 'ACCEPTED')`,
      [carId, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Tu as déjà une demande d'achat en cours pour cette voiture" });
    }

    const { rows } = await query(
      `INSERT INTO purchases (car_id, buyer_id, price, note)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [carId, req.user.id, car.sale_price, note || null]
    );

    res.status(201).json({ purchase: await fetchPurchaseById(rows[0].id) });
  } catch (err) {
    next(err);
  }
}

// GET /api/purchases/me — les demandes du client connecté
export async function myPurchases(req, res, next) {
  try {
    const { rows } = await query(`${PURCHASE_SELECT} WHERE p.buyer_id = $1 ORDER BY p.created_at DESC`, [req.user.id]);
    res.json({ purchases: rows.map(toPurchase) });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/purchases
export async function adminListPurchases(_req, res, next) {
  try {
    const { rows } = await query(`${PURCHASE_SELECT} ORDER BY p.created_at DESC`);
    res.json({ purchases: rows.map(toPurchase) });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/purchases/:id
export async function adminGetPurchase(req, res, next) {
  try {
    const purchase = await fetchPurchaseById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: "Demande d'achat introuvable" });
    }
    res.json({ purchase });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/purchases/:id/status — accepter / rejeter / finaliser / annuler
// Quand une vente est COMPLETED : la voiture sort du catalogue et
// les autres demandes en cours sur cette voiture sont rejetées.
export async function adminUpdatePurchaseStatus(req, res, next) {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!PURCHASE_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Statut invalide. Valeurs possibles : ${PURCHASE_STATUSES.join(", ")}` });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query("SELECT * FROM purchases WHERE id = $1 FOR UPDATE", [id]);
    const purchase = rows[0];
    if (!purchase) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Demande d'achat introuvable" });
    }

    await client.query(
      `UPDATE purchases
       SET status = $1::purchase_status,
           decided_at = CASE WHEN $1::text = 'PENDING' THEN NULL ELSE now() END
       WHERE id = $2`,
      [status, id]
    );

    if (status === "COMPLETED") {
      // La voiture est vendue : on la retire du catalogue
      await client.query(
        `UPDATE cars SET status = 'INACTIVE', is_for_rent = false, is_for_sale = false
         WHERE id = $1`,
        [purchase.car_id]
      );
      // Et on rejette les autres demandes encore ouvertes sur cette voiture
      await client.query(
        `UPDATE purchases SET status = 'REJECTED', decided_at = now()
         WHERE car_id = $1 AND id <> $2 AND status IN ('PENDING', 'ACCEPTED')`,
        [purchase.car_id, id]
      );
    }

    await client.query("COMMIT");
    res.json({ purchase: await fetchPurchaseById(id) });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}
