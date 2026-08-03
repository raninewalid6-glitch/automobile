// Client API partagé — toutes les requêtes vers le backend passent par ici.
// Adresse de l'API : variable VITE_API_URL si définie, sinon détection automatique :
// - site ouvert en local (localhost) -> API locale
// - site en ligne (Vercel ou autre)  -> API de production sur Render
const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://djibdrive-api.onrender.com/api");

export async function apiFetch(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Impossible de contacter le serveur — vérifie que l'API est démarrée (cd backend && npm run dev)");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // réponse sans corps JSON
  }

  if (!res.ok) {
    throw new Error(data?.message || `Erreur ${res.status}`);
  }
  return data;
}

// Envoi de fichiers (photos) vers l'API — utilise FormData au lieu de JSON
export async function apiUpload(path, { files, token }) {
  const formData = new FormData();
  [...files].forEach((file) => formData.append("photos", file));

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  } catch {
    throw new Error("Impossible de contacter le serveur — vérifie que l'API est démarrée (cd backend && npm run dev)");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // réponse sans corps JSON
  }

  if (!res.ok) {
    throw new Error(data?.message || `Erreur ${res.status}`);
  }
  return data;
}
