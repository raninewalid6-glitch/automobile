import { pool, query } from "../config/db.js";

// Requête de base : voiture + nom du propriétaire + photos agrégées en tableau JSON
const CAR_SELECT = `
  SELECT c.*, u.full_name AS owner_name,
         COALESCE(
           json_agg(p.url ORDER BY p.position, p.created_at) FILTER (WHERE p.id IS NOT NULL),
           '[]'::json
         ) AS images
  FROM cars c
  JOIN users u ON u.id = c.owner_id
  LEFT JOIN car_photos p ON p.car_id = c.id
`;
const CAR_GROUP = " GROUP BY c.id, u.full_name ";

// Convertit une ligne SQL (snake_case) vers le format du frontend (camelCase)
function toCar(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    owner: row.owner_name,
    title: row.title,
    brand: row.brand,
    model: row.model,
    year: row.year,
    transmission: row.transmission,
    fuelType: row.fuel_type,
    category: row.category,
    seats: row.seats,
    doors: row.doors,
    airConditioning: row.air_conditioning,
    color: row.color,
    plateNumber: row.plate_number,
    city: row.city,
    address: row.address,
    mileage: row.mileage,
    insurance: row.insurance,
    status: row.status,
    isForRent: row.is_for_rent,
    rentPricePerDay: row.rent_price_per_day,
    depositAmount: row.deposit_amount,
    isForSale: row.is_for_sale,
    salePrice: row.sale_price,
    images: row.images,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Transforme les erreurs PostgreSQL en messages compréhensibles
function handleDbError(err, res) {
  if (err.code === "23505") {
    return res.status(409).json({ message: "Une voiture avec cette plaque existe déjà" });
  }
  if (err.code === "23514" && err.constraint === "rent_price_required") {
    return res.status(400).json({ message: "Une voiture à louer doit avoir un prix de location par jour" });
  }
  if (err.code === "23514" && err.constraint === "sale_price_required") {
    return res.status(400).json({ message: "Une voiture à vendre doit avoir un prix de vente" });
  }
  if (err.code === "22P02") {
    return res.status(400).json({ message: "Valeur invalide dans le formulaire (statut, transmission, carburant ou catégorie)" });
  }
  return null;
}

async function fetchCarById(id) {
  const { rows } = await query(`${CAR_SELECT} WHERE c.id = $1 ${CAR_GROUP}`, [id]);
  return rows[0] ? toCar(rows[0]) : null;
}

// GET /api/cars — liste publique (voitures actives uniquement)
export async function listPublicCars(_req, res, next) {
  try {
    const { rows } = await query(
      `${CAR_SELECT} WHERE c.status = 'ACTIVE' ${CAR_GROUP} ORDER BY c.created_at DESC`
    );
    res.json({ cars: rows.map(toCar) });
  } catch (err) {
    next(err);
  }
}

// GET /api/cars/:id — détail public
export async function getPublicCar(req, res, next) {
  try {
    const car = await fetchCarById(req.params.id);
    if (!car || car.status !== "ACTIVE") {
      return res.status(404).json({ message: "Voiture introuvable" });
    }
    res.json({ car });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/cars — toutes les voitures (admin)
export async function adminListCars(_req, res, next) {
  try {
    const { rows } = await query(`${CAR_SELECT} ${CAR_GROUP} ORDER BY c.created_at DESC`);
    res.json({ cars: rows.map(toCar) });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/cars/:id — détail (admin, tous statuts)
export async function adminGetCar(req, res, next) {
  try {
    const car = await fetchCarById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Voiture introuvable" });
    }
    res.json({ car });
  } catch (err) {
    next(err);
  }
}

const REQUIRED_FIELDS = ["title", "brand", "model", "year", "transmission", "fuelType", "category", "plateNumber", "city"];

// POST /api/admin/cars — créer une voiture (+ photos)
export async function adminCreateCar(req, res, next) {
  const body = req.body || {};
  const missing = REQUIRED_FIELDS.filter((field) => !body[field] && body[field] !== 0);
  if (missing.length > 0) {
    return res.status(400).json({ message: `Champs obligatoires manquants : ${missing.join(", ")}` });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO cars (owner_id, title, brand, model, year, transmission, fuel_type, category,
                         seats, doors, air_conditioning, color, plate_number, city, address,
                         mileage, insurance, status, is_for_rent, rent_price_per_day,
                         deposit_amount, is_for_sale, sale_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
               $16, $17, $18, $19, $20, $21, $22, $23)
       RETURNING id`,
      [
        body.ownerId || req.user.id,
        body.title, body.brand, body.model, body.year,
        body.transmission, body.fuelType, body.category,
        body.seats ?? 5, body.doors ?? 5, body.airConditioning ?? true,
        body.color || null, body.plateNumber, body.city, body.address || null,
        body.mileage ?? null, body.insurance || null, body.status || "DRAFT",
        body.isForRent ?? true, body.rentPricePerDay ?? null,
        body.depositAmount ?? null, body.isForSale ?? false, body.salePrice ?? null,
      ]
    );

    const carId = rows[0].id;
    const images = (body.images || []).filter((url) => url && url.trim());
    for (let i = 0; i < images.length; i++) {
      await client.query(
        "INSERT INTO car_photos (car_id, url, position) VALUES ($1, $2, $3)",
        [carId, images[i].trim(), i]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ car: await fetchCarById(carId) });
  } catch (err) {
    await client.query("ROLLBACK");
    if (!handleDbError(err, res)) next(err);
  } finally {
    client.release();
  }
}

// PUT /api/admin/cars/:id — modifier une voiture (+ remplacer les photos si fournies)
export async function adminUpdateCar(req, res, next) {
  const { id } = req.params;
  const body = req.body || {};

  const existing = await fetchCarById(id).catch(() => null);
  if (!existing) {
    return res.status(404).json({ message: "Voiture introuvable" });
  }

  // Valeur envoyée sinon valeur actuelle (permet les mises à jour partielles, ex: juste le statut)
  const merged = { ...existing, ...body };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE cars SET
         title = $1, brand = $2, model = $3, year = $4, transmission = $5, fuel_type = $6,
         category = $7, seats = $8, doors = $9, air_conditioning = $10, color = $11,
         plate_number = $12, city = $13, address = $14, mileage = $15, insurance = $16,
         status = $17, is_for_rent = $18, rent_price_per_day = $19, deposit_amount = $20,
         is_for_sale = $21, sale_price = $22, owner_id = $23
       WHERE id = $24`,
      [
        merged.title, merged.brand, merged.model, merged.year, merged.transmission, merged.fuelType,
        merged.category, merged.seats, merged.doors, merged.airConditioning, merged.color,
        merged.plateNumber, merged.city, merged.address, merged.mileage, merged.insurance,
        merged.status, merged.isForRent, merged.rentPricePerDay, merged.depositAmount,
        merged.isForSale, merged.salePrice, merged.ownerId, id,
      ]
    );

    if (Array.isArray(body.images)) {
      await client.query("DELETE FROM car_photos WHERE car_id = $1", [id]);
      const images = body.images.filter((url) => url && url.trim());
      for (let i = 0; i < images.length; i++) {
        await client.query(
          "INSERT INTO car_photos (car_id, url, position) VALUES ($1, $2, $3)",
          [id, images[i].trim(), i]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ car: await fetchCarById(id) });
  } catch (err) {
    await client.query("ROLLBACK");
    if (!handleDbError(err, res)) next(err);
  } finally {
    client.release();
  }
}

// DELETE /api/admin/cars/:id
export async function adminDeleteCar(req, res, next) {
  try {
    const { rowCount } = await query("DELETE FROM cars WHERE id = $1", [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: "Voiture introuvable" });
    }
    res.json({ message: "Voiture supprimée" });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({
        message: "Impossible de supprimer : cette voiture a des réservations ou des demandes d'achat. Désactive-la plutôt.",
      });
    }
    next(err);
  }
}
