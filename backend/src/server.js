import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import carsRoutes from "./routes/cars.routes.js";
import adminCarsRoutes from "./routes/adminCars.routes.js";

const app = express();

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
