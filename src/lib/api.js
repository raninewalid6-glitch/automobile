// Client API partagé — toutes les requêtes vers le backend passent par ici
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
