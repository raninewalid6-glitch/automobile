import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ImagePlus, Save } from "lucide-react";
import { adminCars, carStatusLabels } from "../mock/adminCars.mock";

const defaultCar = {
  id: "CAR-NEW",
  title: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  transmission: "Automatique",
  fuelType: "Essence",
  category: "SUV",
  seats: 5,
  doors: 5,
  airConditioning: true,
  color: "",
  plateNumber: "",
  city: "Djibouti",
  address: "",
  owner: "",
  images: [""],
  status: "active",
  isForRent: true,
  isForSale: false,
  rentPricePerDay: 0,
  salePrice: 0,
  mileage: 0,
  insurance: "",
  depositAmount: 0,
};

const options = {
  transmission: ["Automatique", "Manuelle"],
  fuelType: ["Essence", "Diesel", "Hybride", "Électrique"],
  category: ["Citadine", "Berline", "Berline premium", "SUV", "SUV compact", "4x4", "Utilitaire"],
  city: ["Djibouti", "Balbala", "Arta", "Tadjourah", "Ali Sabieh", "Dikhil", "Obock"],
};

function Field({ label, children }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-red-500/50";

export default function CarFormPage() {
  const [form, setForm] = useState(defaultCar);
  const [savedMessage, setSavedMessage] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateImage = (index, value) => {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => (imageIndex === index ? value : image)),
    }));
  };

  const addImage = () => {
    setForm((current) => ({ ...current, images: [...current.images, ""] }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSavedMessage("Voiture enregistrée en mock. Aucune donnée backend n'a été modifiée.");
  };

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <Link to="/admin/cars" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Retour aux voitures
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-700 dark:text-orange-200">
              Formulaire complet mock
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">Créer / modifier une voiture</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Tous les champs du modèle voiture sont présents pour préparer la future connexion API.
            </p>
          </div>
          <p className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            Exemple existant: {adminCars[0].id} · {adminCars[0].title}
          </p>
        </div>
      </section>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Identité & caractéristiques</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="ID">
              <input className={inputClass} value={form.id} onChange={(event) => updateField("id", event.target.value)} />
            </Field>
            <Field label="Titre">
              <input className={inputClass} value={form.title} placeholder="Toyota Land Cruiser VX" onChange={(event) => updateField("title", event.target.value)} />
            </Field>
            <Field label="Marque">
              <input className={inputClass} value={form.brand} placeholder="Toyota" onChange={(event) => updateField("brand", event.target.value)} />
            </Field>
            <Field label="Modèle">
              <input className={inputClass} value={form.model} placeholder="Land Cruiser" onChange={(event) => updateField("model", event.target.value)} />
            </Field>
            <Field label="Année">
              <input className={inputClass} type="number" value={form.year} onChange={(event) => updateField("year", Number(event.target.value))} />
            </Field>
            <Field label="Transmission">
              <select className={inputClass} value={form.transmission} onChange={(event) => updateField("transmission", event.target.value)}>
                {options.transmission.map((value) => <option key={value}>{value}</option>)}
              </select>
            </Field>
            <Field label="Carburant">
              <select className={inputClass} value={form.fuelType} onChange={(event) => updateField("fuelType", event.target.value)}>
                {options.fuelType.map((value) => <option key={value}>{value}</option>)}
              </select>
            </Field>
            <Field label="Catégorie">
              <select className={inputClass} value={form.category} onChange={(event) => updateField("category", event.target.value)}>
                {options.category.map((value) => <option key={value}>{value}</option>)}
              </select>
            </Field>
            <Field label="Places">
              <input className={inputClass} type="number" value={form.seats} onChange={(event) => updateField("seats", Number(event.target.value))} />
            </Field>
            <Field label="Portes">
              <input className={inputClass} type="number" value={form.doors} onChange={(event) => updateField("doors", Number(event.target.value))} />
            </Field>
            <Field label="Couleur">
              <input className={inputClass} value={form.color} placeholder="Blanc nacré" onChange={(event) => updateField("color", event.target.value)} />
            </Field>
            <Field label="Plaque">
              <input className={inputClass} value={form.plateNumber} placeholder="DJ-0000-A" onChange={(event) => updateField("plateNumber", event.target.value)} />
            </Field>
          </div>
          <label className="mt-5 flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <input type="checkbox" checked={form.airConditioning} onChange={(event) => updateField("airConditioning", event.target.checked)} />
            Climatisation disponible
          </label>
        </section>

        <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Localisation & owner</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Ville">
              <select className={inputClass} value={form.city} onChange={(event) => updateField("city", event.target.value)}>
                {options.city.map((value) => <option key={value}>{value}</option>)}
              </select>
            </Field>
            <Field label="Adresse">
              <input className={inputClass} value={form.address} placeholder="Quartier, rue, point de retrait" onChange={(event) => updateField("address", event.target.value)} />
            </Field>
            <Field label="Owner">
              <input className={inputClass} value={form.owner} placeholder="DriveUp Fleet" onChange={(event) => updateField("owner", event.target.value)} />
            </Field>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Publication, pricing & garanties</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Statut">
              <select className={inputClass} value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                {Object.entries(carStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Prix location / jour">
              <input className={inputClass} type="number" value={form.rentPricePerDay} onChange={(event) => updateField("rentPricePerDay", Number(event.target.value))} />
            </Field>
            <Field label="Prix de vente">
              <input className={inputClass} type="number" value={form.salePrice} onChange={(event) => updateField("salePrice", Number(event.target.value))} />
            </Field>
            <Field label="Caution">
              <input className={inputClass} type="number" value={form.depositAmount} onChange={(event) => updateField("depositAmount", Number(event.target.value))} />
            </Field>
            <Field label="Kilométrage">
              <input className={inputClass} type="number" value={form.mileage} onChange={(event) => updateField("mileage", Number(event.target.value))} />
            </Field>
            <Field label="Assurance">
              <input className={inputClass} value={form.insurance} placeholder="Tous risques - expire le..." onChange={(event) => updateField("insurance", event.target.value)} />
            </Field>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <input type="checkbox" checked={form.isForRent} onChange={(event) => updateField("isForRent", event.target.checked)} />
              Disponible à la location
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <input type="checkbox" checked={form.isForSale} onChange={(event) => updateField("isForSale", event.target.checked)} />
              Disponible à la vente
            </label>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Photos</h3>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" onClick={addImage}>
              <ImagePlus className="h-4 w-4" /> Ajouter une URL
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {form.images.map((image, index) => (
              <Field key={`image-${index}`} label={`Image ${index + 1}`}>
                <input className={inputClass} value={image} placeholder="https://..." onChange={(event) => updateImage(index, event.target.value)} />
              </Field>
            ))}
          </div>
        </section>

        {savedMessage && <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">{savedMessage}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link to="/admin/cars" className="rounded-2xl border border-black/10 dark:border-white/10 px-5 py-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Annuler</Link>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25">
            <Save className="h-5 w-5" /> Enregistrer mock
          </button>
        </div>
      </form>
    </div>
  );
}
