-- ============================================================
-- DjibDrive — Schéma de base de données (PostgreSQL / Neon)
-- Location + vente de voitures
-- À exécuter dans l'éditeur SQL de Neon ou via psql.
-- ============================================================

-- Extension nécessaire pour la contrainte anti-chevauchement des réservations
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'OWNER', 'MANAGER', 'CLIENT');
CREATE TYPE car_status AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');
CREATE TYPE transmission_type AS ENUM ('MANUAL', 'AUTOMATIC');
CREATE TYPE fuel_type AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID');
CREATE TYPE car_category AS ENUM ('ECONOMY', 'SEDAN', 'SUV', 'LUXURY', 'VAN');
CREATE TYPE booking_status AS ENUM ('PENDING', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE payment_method AS ENUM ('WAAFI', 'DMONEY', 'MASTERCARD', 'CASH');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE purchase_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- ------------------------------------------------------------
-- Fonction générique pour tenir à jour updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text        NOT NULL,
  phone         text,
  email         text        NOT NULL UNIQUE,
  password_hash text        NOT NULL,
  role          user_role   NOT NULL DEFAULT 'CLIENT',
  city          text,
  address       text,
  id_document   text,                          -- ex : "CIN 00391827"
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- CARS
-- ------------------------------------------------------------
CREATE TABLE cars (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id           uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  title              text NOT NULL,
  brand              text NOT NULL,
  model              text NOT NULL,
  year               int  NOT NULL CHECK (year BETWEEN 1980 AND 2100),
  transmission       transmission_type NOT NULL,
  fuel_type          fuel_type         NOT NULL,
  category           car_category      NOT NULL,
  seats              int  NOT NULL CHECK (seats > 0),
  doors              int  NOT NULL CHECK (doors > 0),
  air_conditioning   boolean NOT NULL DEFAULT true,
  color              text,
  plate_number       text NOT NULL UNIQUE,
  city               text NOT NULL,
  address            text,
  mileage            int CHECK (mileage >= 0),
  insurance          text,
  status             car_status NOT NULL DEFAULT 'DRAFT',
  -- Location
  is_for_rent        boolean NOT NULL DEFAULT true,
  rent_price_per_day int CHECK (rent_price_per_day >= 0),
  deposit_amount     int CHECK (deposit_amount >= 0),
  -- Vente
  is_for_sale        boolean NOT NULL DEFAULT false,
  sale_price         int CHECK (sale_price >= 0),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  -- Une voiture à louer doit avoir un prix/jour ; une voiture à vendre un prix de vente
  CONSTRAINT rent_price_required CHECK (NOT is_for_rent OR rent_price_per_day IS NOT NULL),
  CONSTRAINT sale_price_required CHECK (NOT is_for_sale OR sale_price IS NOT NULL)
);

CREATE INDEX cars_owner_id_idx ON cars (owner_id);
CREATE INDEX cars_status_idx   ON cars (status);
CREATE INDEX cars_city_idx     ON cars (city);

CREATE TRIGGER cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- CAR PHOTOS
-- ------------------------------------------------------------
CREATE TABLE car_photos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id     uuid NOT NULL REFERENCES cars (id) ON DELETE CASCADE,
  url        text NOT NULL,
  position   int  NOT NULL DEFAULT 0,          -- ordre d'affichage
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX car_photos_car_id_idx ON car_photos (car_id);

-- ------------------------------------------------------------
-- BOOKINGS (locations)
-- ------------------------------------------------------------
CREATE TABLE bookings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id            uuid NOT NULL REFERENCES cars (id)  ON DELETE RESTRICT,
  user_id           uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  status            booking_status NOT NULL DEFAULT 'PENDING',
  start_date        date NOT NULL,
  end_date          date NOT NULL,
  days              int  NOT NULL CHECK (days > 0),
  total_amount      int  NOT NULL CHECK (total_amount >= 0),
  commission_rate   int  NOT NULL DEFAULT 0 CHECK (commission_rate BETWEEN 0 AND 100),
  commission_amount int  NOT NULL DEFAULT 0 CHECK (commission_amount >= 0),
  owner_amount      int  NOT NULL DEFAULT 0 CHECK (owner_amount >= 0),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_period CHECK (end_date >= start_date),
  -- Empêche deux réservations actives qui se chevauchent pour la même voiture
  CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
    car_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  ) WHERE (status IN ('PENDING', 'PENDING_PAYMENT', 'CONFIRMED'))
);

CREATE INDEX bookings_car_id_idx  ON bookings (car_id);
CREATE INDEX bookings_user_id_idx ON bookings (user_id);
CREATE INDEX bookings_status_idx  ON bookings (status);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- PURCHASES (demandes d'achat de voitures en vente)
-- ------------------------------------------------------------
CREATE TABLE purchases (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id     uuid NOT NULL REFERENCES cars (id)  ON DELETE RESTRICT,
  buyer_id   uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  status     purchase_status NOT NULL DEFAULT 'PENDING',
  price      int NOT NULL CHECK (price >= 0),   -- prix convenu au moment de la demande
  note       text,
  decided_at timestamptz,                       -- date d'acceptation / rejet
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX purchases_car_id_idx   ON purchases (car_id);
CREATE INDEX purchases_buyer_id_idx ON purchases (buyer_id);
CREATE INDEX purchases_status_idx   ON purchases (status);

CREATE TRIGGER purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- PAYMENTS
-- Un paiement est lié soit à une réservation (booking_id),
-- soit à un achat (purchase_id) — jamais les deux.
-- ------------------------------------------------------------
CREATE TABLE payments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   uuid REFERENCES bookings (id)  ON DELETE RESTRICT,
  purchase_id  uuid REFERENCES purchases (id) ON DELETE RESTRICT,
  user_id      uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  amount       int NOT NULL CHECK (amount > 0),
  method       payment_method NOT NULL,
  status       payment_status NOT NULL DEFAULT 'PENDING',
  provider_ref text,                            -- référence WAAFI / D-Money / carte
  note         text,
  paid_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_target CHECK (
    (booking_id IS NOT NULL AND purchase_id IS NULL) OR
    (booking_id IS NULL AND purchase_id IS NOT NULL)
  )
);

CREATE INDEX payments_booking_id_idx  ON payments (booking_id);
CREATE INDEX payments_purchase_id_idx ON payments (purchase_id);
CREATE INDEX payments_user_id_idx     ON payments (user_id);
CREATE INDEX payments_status_idx      ON payments (status);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- IMAGES (photos uploadées depuis l'admin, servies par l'API)
-- NB : créée automatiquement par le serveur au démarrage si absente.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data       bytea NOT NULL,
  mime_type  text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- RECEIPTS (reçus PDF — 0..1 par réservation ou achat)
-- ------------------------------------------------------------
CREATE TABLE receipts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     uuid UNIQUE REFERENCES bookings (id)  ON DELETE RESTRICT,
  purchase_id    uuid UNIQUE REFERENCES purchases (id) ON DELETE RESTRICT,
  receipt_number text NOT NULL UNIQUE,          -- ex : "REC-2026-00042"
  pdf_url        text,
  issued_at      timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT receipt_target CHECK (
    (booking_id IS NOT NULL AND purchase_id IS NULL) OR
    (booking_id IS NULL AND purchase_id IS NOT NULL)
  )
);
