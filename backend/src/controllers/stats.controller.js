import { query } from "../config/db.js";

// GET /api/admin/stats — tous les indicateurs du dashboard en un seul appel
export async function adminStats(_req, res, next) {
  try {
    const [inventory, bookingsAgg, purchasesAgg, clientsAgg, paymentsAgg, recent] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total_cars,
                    COUNT(*) FILTER (WHERE is_for_rent)::int AS cars_for_rent,
                    COUNT(*) FILTER (WHERE is_for_sale)::int AS cars_for_sale,
                    COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_cars
             FROM cars`),
      query(`SELECT COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now()))::int AS this_month,
                    COUNT(*) FILTER (WHERE status IN ('PENDING', 'PENDING_PAYMENT'))::int AS pending,
                    COALESCE(SUM(total_amount) FILTER (WHERE status IN ('CONFIRMED', 'COMPLETED')), 0)::int AS rental_revenue,
                    COALESCE(SUM(commission_amount) FILTER (WHERE status IN ('CONFIRMED', 'COMPLETED')), 0)::int AS commission,
                    COALESCE(SUM(owner_amount) FILTER (WHERE status IN ('CONFIRMED', 'COMPLETED')), 0)::int AS owners_amount
             FROM bookings`),
      query(`SELECT COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending,
                    COALESCE(SUM(price) FILTER (WHERE status = 'COMPLETED'), 0)::int AS sales_revenue
             FROM purchases`),
      query(`SELECT COUNT(*)::int AS clients FROM users WHERE role = 'CLIENT'`),
      query(`SELECT COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending FROM payments`),
      // Les 8 dernières opérations (locations + demandes d'achat mélangées)
      query(`SELECT * FROM (
               SELECT b.id, u.full_name AS customer, c.title AS vehicle, 'Location' AS type,
                      b.total_amount AS amount, b.status::text AS status, b.created_at
               FROM bookings b
               JOIN users u ON u.id = b.user_id
               JOIN cars c ON c.id = b.car_id
               UNION ALL
               SELECT p.id, u.full_name, c.title, 'Achat', p.price, p.status::text, p.created_at
               FROM purchases p
               JOIN users u ON u.id = p.buyer_id
               JOIN cars c ON c.id = p.car_id
             ) operations
             ORDER BY created_at DESC
             LIMIT 8`),
    ]);

    const cars = inventory.rows[0];
    const bookings = bookingsAgg.rows[0];
    const purchases = purchasesAgg.rows[0];

    res.json({
      inventory: {
        totalCars: cars.total_cars,
        carsForRent: cars.cars_for_rent,
        carsForSale: cars.cars_for_sale,
        activeCars: cars.active_cars,
      },
      activity: {
        reservationsThisMonth: bookings.this_month,
        pendingBookings: bookings.pending,
        purchaseRequests: purchases.pending,
        pendingPayments: paymentsAgg.rows[0].pending,
        clients: clientsAgg.rows[0].clients,
      },
      revenue: {
        rentalRevenue: bookings.rental_revenue,
        salesRevenue: purchases.sales_revenue,
        platformCommission: bookings.commission,
        ownersAmount: bookings.owners_amount,
      },
      recentOperations: recent.rows.map((row) => ({
        id: row.id,
        customer: row.customer,
        vehicle: row.vehicle,
        type: row.type,
        amount: row.amount,
        status: row.status,
        createdAt: row.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}
