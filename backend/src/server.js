import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import carsRoutes from "./routes/cars.routes.js";
import adminCarsRoutes from "./routes/adminCars.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import adminBookingsRoutes from "./routes/adminBookings.routes.js";
import adminStatsRoutes from "./routes/adminStats.routes.js";
import adminOwnersRoutes from "./routes/adminOwners.routes.js";
import purchasesRoutes from "./routes/purchases.routes.js";
import adminPurchasesRoutes from "./routes/adminPurchases.routes.js";
import adminPaymentsRoutes from "./routes/adminPayments.routes.js";
import adminReceiptsRoutes from "./routes/adminReceipts.routes.js";
import adminUploadsRoutes from "./routes/adminUploads.routes.js";
import { serveImage } from "./controllers/uploads.controller.js";
import { query } from "./config/db.js";

const app = express();

// Derrière le proxy de Render, permet de connaître le vrai protocole (https)
app.set("trust proxy", 1);

// Crée la table des photos uploadées si elle n'existe pas encore
query(`CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data bytea NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
)`).catch((err) => console.error("Migration table images :", err.message));

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      // autorise les requêtes sans origine (curl, Postman) et tout localhost en dev
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("Origine non autorisée par CORS"));
    },
  })
);
app.use(express.json());

// Page d'accueil de l'API (utile pour vérifier que le serveur est en ligne)
app.get("/", (_req, res) => {
  res.json({ name: "API DjibDrive", status: "en ligne", health: "/api/health" });
});

// Vérifie que l'API et la base répondent
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connectée" });
  } catch {
    res.status(503).json({ status: "ok", database: "inaccessible — vérifie DATABASE_URL dans backend/.env" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/cars", carsRoutes);
app.use("/api/admin/cars", adminCarsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/admin/bookings", adminBookingsRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/admin/owners", adminOwnersRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/api/admin/purchases", adminPurchasesRoutes);
app.use("/api/admin/payments", adminPaymentsRoutes);
app.use("/api/admin/receipts", adminReceiptsRoutes);
app.use("/api/admin/uploads", adminUploadsRoutes);
app.get("/api/images/:id", serveImage);

// 404 JSON pour les routes inconnues de l'API
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

// Gestionnaire d'erreurs global
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Erreur serveur" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ API DjibDrive démarrée sur http://localhost:${port}`);
});
