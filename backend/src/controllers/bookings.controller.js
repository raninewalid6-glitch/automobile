import { query } from "../config/db.js";
import { toDateString } from "../lib/dates.js";

// Commission de la plateforme en % (modifiable via .env)
const COMMISSION_RATE = Number(process.env.COMMISSION_RATE || 10);

const BOOKING_STATUSES = ["PENDING", "PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "COMPLETED"];

// Réservation + infos voiture, client et propriétaire
const BOOKING_SELECT = `
  SELECT b.*,
         c.title AS car_title, c.brand AS car_brand, c.plate_number AS car_plate, c.city AS car_city,
         c.rent_price_per_day AS car_price_per_day,
         u.full_name AS client_name, u.email AS client_email, u.phone AS client_phone,
         o.full_name AS owner_name,
         (SELECT p.url FROM car_photos p WHERE p.car_id = c.id ORDER BY p.position, p.created_at LIMIT 1) AS car_image
  FROM bookings b
  JOIN cars c ON c.id = b.car_id
  JOIN users u ON u.id = b.user_id
  JOIN users o ON o.id = c.owner_id
`;

function toBooking(row) {
  return {
    id: row.id,
    status: row.status,
    startDate: toDateString(row.start_date),
    endDate: toDateString(row.end_date),
    days: row.days,
    totalAmount: row.total_amount,
    commissionRate: row.commission_rate,
    commissionAmount: row.commission_amount,
    ownerAmount: row.owner_amount,
    car: {
      id: row.car_id,
      title: row.car_title,
      brand: row.car_brand,
      plateNumber: row.car_plate,
      city: row.car_city,
      pricePerDay: row.car_price_per_day,
      image: row.car_image,
    },
    client: {
      id: row.user_id,
      name: row.client_name,
      email: row.client_email,
      phone: row.client_phone,
    },
    owner: row.owner_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function handleBookingDbError(err, res) {
  if (err.code === "23P01") {
    return res.status(409).json({ message: "Cette voiture est déjà réservée sur ces dates. Choisis d'autres dates." });
  }
  if (err.code === "23514") {
    return res.status(400).json({ message: "Dates invalides : la date de fin doit être après la date de début" });
  }
  if (err.code === "22007" || err.code === "22008" || err.code === "22P02") {
    return res.status(400).json({ message: "Format de date invalide (attendu : AAAA-MM-JJ)" });
  }
  return null;
}

// POST /api/bookings — un client réserve une voiture (prix calculé par le serveur)
export async function createBooking(req, res, next) {
  try {
    const { carId, startDate, endDate } = req.body || {};
    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ message: "carId, startDate et endDate sont obligatoires" });
    }

    const { rows: carRows } = await query("SELECT * FROM cars WHERE id = $1", [carId]);
    const car = carRows[0];
    if (!car || car.status !== "ACTIVE" || !car.is_for_rent || car.rent_price_per_day == null) {
      return res.status(400).json({ message: "Cette voiture n'est pas disponible à la location" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: "Format de date invalide (attendu : AAAA-MM-JJ)" });
    }
    if (end < start) {
      return res.status(400).json({ message: "La date de fin doit être après la date de début" });
    }

    // Nombre de jours facturés (minimum 1, même pour une seule journée)
    const days = Math.max(1, Math.round((end - start) / 86400000));
    const totalAmount = days * car.rent_price_per_day;
    const commissionAmount = Math.round((totalAmount * COMMISSION_RATE) / 100);
    const ownerAmount = totalAmount - commissionAmount;

    const { rows } = await query(
      `INSERT INTO bookings (car_id, user_id, start_date, end_date, days,
                             total_amount, commission_rate, commission_amount, owner_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [carId, req.user.id, startDate, endDate, days, totalAmount, COMMISSION_RATE, commissionAmount, ownerAmount]
    );

    const { rows: full } = await query(`${BOOKING_SELECT} WHERE b.id = $1`, [rows[0].id]);
    res.status(201).json({ booking: toBooking(full[0]) });
  } catch (err) {
    if (!handleBookingDbError(err, res)) next(err);
  }
}

// GET /api/bookings/me — les réservations du client connecté
export async function myBookings(req, res, next) {
  try {
    const { rows } = await query(`${BOOKING_SELECT} WHERE b.user_id = $1 ORDER BY b.created_at DESC`, [req.user.id]);
    res.json({ bookings: rows.map(toBooking) });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/bookings — toutes les réservations (admin)
export async function adminListBookings(_req, res, next) {
  try {
    const { rows } = await query(`${BOOKING_SELECT} ORDER BY b.created_at DESC`);
    res.json({ bookings: rows.map(toBooking) });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/bookings/:id
export async function adminGetBooking(req, res, next) {
  try {
    const { rows } = await query(`${BOOKING_SELECT} WHERE b.id = $1`, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Réservation introuvable" });
    }
    res.json({ booking: toBooking(rows[0]) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/bookings/:id/status — confirmer / annuler / terminer
export async function adminUpdateBookingStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Statut invalide. Valeurs possibles : ${BOOKING_STATUSES.join(", ")}` });
    }

    const { rowCount } = await query("UPDATE bookings SET status = $1 WHERE id = $2", [status, req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: "Réservation introuvable" });
    }

    const { rows } = await query(`${BOOKING_SELECT} WHERE b.id = $1`, [req.params.id]);
    res.json({ booking: toBooking(rows[0]) });
  } catch (err) {
    if (!handleBookingDbError(err, res)) next(err);
  }
}
