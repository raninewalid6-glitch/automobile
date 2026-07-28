import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { toDateString } from "../lib/dates.js";

// Un "owner" = un utilisateur qui possède au moins une voiture, ou dont le rôle est OWNER.
// Les métriques (voitures, réservations, revenus) sont calculées par la base.
const OWNER_SELECT = `
  SELECT u.id, u.full_name, u.email, u.phone, u.city, u.address, u.role, u.created_at,
         car_stats.total_cars, car_stats.rental_cars, car_stats.sale_cars,
         COALESCE(booking_stats.reservations, 0) AS reservations,
         COALESCE(booking_stats.revenue, 0) AS revenue,
         COALESCE(booking_stats.commission, 0) AS commission,
         COALESCE(purchase_stats.sales, 0) AS sales
  FROM users u
  JOIN LATERAL (
    SELECT COUNT(*)::int AS total_cars,
           COUNT(*) FILTER (WHERE is_for_rent)::int AS rental_cars,
           COUNT(*) FILTER (WHERE is_for_sale)::int AS sale_cars
    FROM cars WHERE owner_id = u.id
  ) car_stats ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS reservations,
           COALESCE(SUM(b.owner_amount) FILTER (WHERE b.status IN ('CONFIRMED', 'COMPLETED')), 0)::int AS revenue,
           COALESCE(SUM(b.commission_amount) FILTER (WHERE b.status IN ('CONFIRMED', 'COMPLETED')), 0)::int AS commission
    FROM bookings b
    JOIN cars c ON c.id = b.car_id
    WHERE c.owner_id = u.id
  ) booking_stats ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) FILTER (WHERE p.status = 'COMPLETED')::int AS sales
    FROM purchases p
    JOIN cars c ON c.id = p.car_id
    WHERE c.owner_id = u.id
  ) purchase_stats ON true
  WHERE u.role = 'OWNER' OR car_stats.total_cars > 0
`;

function toOwner(row) {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    address: row.address,
    role: row.role,
    joinedAt: row.created_at,
    metrics: {
      totalCars: row.total_cars,
      rentalCars: row.rental_cars,
      saleCars: row.sale_cars,
      reservations: row.reservations,
      sales: row.sales,
      revenue: row.revenue,
      commission: row.commission,
    },
  };
}

// GET /api/admin/owners
export async function adminListOwners(_req, res, next) {
  try {
    const { rows } = await query(`${OWNER_SELECT} ORDER BY u.full_name`);
    res.json({ owners: rows.map(toOwner) });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/owners/:id — profil + ses voitures + ses dernières réservations
export async function adminGetOwner(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await query(`${OWNER_SELECT} AND u.id = $1`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Propriétaire introuvable" });
    }

    const [cars, bookings] = await Promise.all([
      query(
        `SELECT c.id, c.title, c.city, c.status, c.is_for_rent, c.rent_price_per_day,
                c.is_for_sale, c.sale_price,
                COALESCE(SUM(b.owner_amount) FILTER (WHERE b.status IN ('CONFIRMED', 'COMPLETED')), 0)::int AS revenue
         FROM cars c
         LEFT JOIN bookings b ON b.car_id = c.id
         WHERE c.owner_id = $1
         GROUP BY c.id
         ORDER BY c.created_at DESC`,
        [id]
      ),
      query(
        `SELECT b.id, b.start_date, b.end_date, b.days, b.total_amount, b.owner_amount, b.status,
                u.full_name AS client, c.title AS car
         FROM bookings b
         JOIN cars c ON c.id = b.car_id
         JOIN users u ON u.id = b.user_id
         WHERE c.owner_id = $1
         ORDER BY b.created_at DESC
         LIMIT 20`,
        [id]
      ),
    ]);

    res.json({
      owner: toOwner(rows[0]),
      cars: cars.rows.map((car) => ({
        id: car.id,
        title: car.title,
        city: car.city,
        status: car.status,
        isForRent: car.is_for_rent,
        rentPricePerDay: car.rent_price_per_day,
        isForSale: car.is_for_sale,
        salePrice: car.sale_price,
        revenue: car.revenue,
      })),
      bookings: bookings.rows.map((booking) => ({
        id: booking.id,
        client: booking.client,
        car: booking.car,
        startDate: toDateString(booking.start_date),
        endDate: toDateString(booking.end_date),
        days: booking.days,
        totalAmount: booking.total_amount,
        ownerAmount: booking.owner_amount,
        status: booking.status,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/owners — créer un compte propriétaire (rôle OWNER)
export async function adminCreateOwner(req, res, next) {
  try {
    const { fullName, email, password, phone, city, address } = req.body || {};
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email et password sont obligatoires" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit faire au moins 6 caractères" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (full_name, email, password_hash, role, phone, city, address)
       VALUES ($1, $2, $3, 'OWNER', $4, $5, $6)
       RETURNING id, full_name, email, phone, city, role`,
      [fullName.trim(), email.toLowerCase().trim(), passwordHash, phone || null, city || null, address || null]
    );

    res.status(201).json({ owner: rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Un compte existe déjà avec cet email" });
    }
    next(err);
  }
}
