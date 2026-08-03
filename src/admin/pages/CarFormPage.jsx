import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Save, Trash2, Upload } from "lucide-react";
import { apiFetch, apiUpload } from "../../lib/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  carStatusLabels,
  transmissionLabels,
  fuelTypeLabels,
  categoryLabels,
  cities,
} from "../lib/carOptions";

const defaultCar = {
  title: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  transmission: "AUTOMATIC",
  fuelType: "PETROL",
  category: "SUV",
  seats: 5,
  doors: 5,
  airConditioning: true,
  color: "",
  plateNumber: "",
  city: "Djibouti",
  address: "",
  images: [""],
  status: "DRAFT",
  isForRent: true,
  isForSale: false,
  rentPricePerDay: 0,
  salePrice: 0,
  mileage: 0,
  insurance: "",
  depositAmount: 0,
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
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token } = useAdminAuth();

  const [form, setForm] = useState(defaultCar);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    apiFetch("/admin/owners", { token })
      .then((data) => setOwners(data.owners))
      .catch(() => setOwners([]));
  }, [token]);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/admin/cars/${id}`, { token })
      .then((data) => {
        const car = data.car;
        setForm({
          ...defaultCar,
          ...car,
          color: car.color ?? "",
          address: car.address ?? "",
          insurance: car.insurance ?? "",
          rentPricePerDay: car.rentPricePerDay ?? 0,
          salePrice: car.salePrice ?? 0,
          mileage: car.mileage ?? 0,
          depositAmount: car.depositAmount ?? 0,
          images: car.images.length > 0 ? car.images : [""],
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit, token]);

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

  const removeImage = (index) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  // Upload des fichiers choisis, puis ajout de leurs URLs à la liste des photos
  const handleFilesSelected = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const data = await apiUpload("/admin/uploads", { files, token });
      setForm((current) => ({
        ...current,
        images: [...current.images.filter((url) => url && url.trim()), ...data.urls],
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = { ...form, images: form.images.filter((url) => url && url.trim()) };
      if (isEdit) {
        await apiFetch(`/admin/cars/${id}`, { method: "PUT", token, body: payload });
      } else {
        await apiFetch("/admin/cars", { method: "POST", token, body: payload });
      }
      navigate("/admin/cars");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="py-10 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">Chargement de la voiture...</p>
    );
  }

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <Link to="/admin/cars" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Retour aux voitures
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-700 dark:text-orange-200">
              Formulaire voiture
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">
              {isEdit ? "Modifier la voiture" : "Créer une voiture"}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              {isEdit
                ? "Les modifications sont enregistrées directement dans la base."
                : "La voiture sera enregistrée dans la base et visible selon son statut."}
            </p>
          </div>
        </div>
      </section>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Identité & caractéristiques</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Titre">
              <input className={inputClass} value={form.title} placeholder="Toyota Land Cruiser VX" onChange={(event) => updateField("title", event.target.value)} required />
            </Field>
            <Field label="Marque">
              <input className={inputClass} value={form.brand} placeholder="Toyota" onChange={(event) => updateField("brand", event.target.value)} required />
            </Field>
            <Field label="Modèle">
              <input className={inputClass} value={form.model} placeholder="Land Cruiser" onChange={(event) => updateField("model", event.target.value)} required />
            </Field>
            <Field label="Année">
              <input className={inputClass} type="number" value={form.year} onChange={(event) => updateField("year", Number(event.target.value))} required />
            </Field>
            <Field label="Transmission">
              <select className={inputClass} value={form.transmission} onChange={(event) => updateField("transmission", event.target.value)}>
                {Object.entries(transmissionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Carburant">
              <select className={inputClass} value={form.fuelType} onChange={(event) => updateField("fuelType", event.target.value)}>
                {Object.entries(fuelTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Catégorie">
              <select className={inputClass} value={form.category} onChange={(event) => updateField("category", event.target.value)}>
                {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Places">
              <input className={inputClass} type="number" min="1" value={form.seats} onChange={(event) => updateField("seats", Number(event.target.value))} />
            </Field>
            <Field label="Portes">
              <input className={inputClass} type="number" min="1" value={form.doors} onChange={(event) => updateField("doors", Number(event.target.value))} />
            </Field>
            <Field label="Couleur">
              <input className={inputClass} value={form.color} placeholder="Blanc nacré" onChange={(event) => updateField("color", event.target.value)} />
            </Field>
            <Field label="Plaque">
              <input className={inputClass} value={form.plateNumber} placeholder="DJ-0000-A" onChange={(event) => updateField("plateNumber", event.target.value)} required />
            </Field>
          </div>
          <label className="mt-5 flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <input type="checkbox" checked={form.airConditioning} onChange={(event) => updateField("airConditioning", event.target.checked)} />
            Climatisation disponible
          </label>
        </section>

        <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Localisation & propriétaire</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Ville">
              <select className={inputClass} value={form.city} onChange={(event) => updateField("city", event.target.value)}>
                {cities.map((value) => <option key={value}>{value}</option>)}
              </select>
            </Field>
            <Field label="Adresse">
              <input className={inputClass} value={form.address} placeholder="Quartier, rue, point de retrait" onChange={(event) => updateField("address", event.target.value)} />
            </Field>
            <Field label="Propriétaire">
              <select className={inputClass} value={form.ownerId ?? ""} onChange={(event) => updateField("ownerId", event.target.value || undefined)}>
                <option value="">Moi (compte connecté)</option>
                {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
              </select>
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
              <input className={inputClass} type="number" min="0" value={form.rentPricePerDay} onChange={(event) => updateField("rentPricePerDay", Number(event.target.value))} />
            </Field>
            <Field label="Prix de vente">
              <input className={inputClass} type="number" min="0" value={form.salePrice} onChange={(event) => updateField("salePrice", Number(event.target.value))} />
            </Field>
            <Field label="Caution">
              <input className={inputClass} type="number" min="0" value={form.depositAmount} onChange={(event) => updateField("depositAmount", Number(event.target.value))} />
            </Field>
            <Field label="Kilométrage">
              <input className={inputClass} type="number" min="0" value={form.mileage} onChange={(event) => updateField("mileage", Number(event.target.value))} />
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Photos</h3>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={handleFilesSelected}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-600/25 disabled:opacity-60"
              >
                <Upload className="h-4 w-4" /> {uploading ? "Envoi en cours..." : "Choisir des fichiers"}
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" onClick={addImage}>
                <ImagePlus className="h-4 w-4" /> Ajouter une URL
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Choisis des photos depuis ton ordinateur ou ton téléphone (JPEG, PNG, WebP — 4 Mo max par photo), ou colle une adresse d'image.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {form.images.map((image, index) => {
              // Photo venue du bouton "Choisir des fichiers" : on montre juste l'aperçu
              const isUploaded = image.includes("/api/images/");
              return (
                <div key={`image-${index}`} className="space-y-2">
                  {!isUploaded && (
                    <div className="flex items-center gap-2">
                      <input className={inputClass} value={image} placeholder="https://..." onChange={(event) => updateImage(index, event.target.value)} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        title="Retirer cette photo"
                        className="shrink-0 rounded-xl border border-red-500/30 p-2.5 text-red-600 dark:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {image && image.trim() && (
                    <div className="relative">
                      <img
                        src={image}
                        alt={`Aperçu ${index + 1}`}
                        className="h-36 w-full rounded-2xl border border-black/10 dark:border-white/10 object-cover"
                        onError={(event) => { event.currentTarget.style.display = "none"; }}
                        onLoad={(event) => { event.currentTarget.style.display = ""; }}
                      />
                      {isUploaded && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          title="Retirer cette photo"
                          className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {error && <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link to="/admin/cars" className="rounded-2xl border border-black/10 dark:border-white/10 px-5 py-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Annuler</Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-5 w-5" /> {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
