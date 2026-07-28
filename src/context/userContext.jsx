import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

// 1. Création du context
const AuthContext = createContext(null);

const SESSION_KEY = "client_session";

// Ajoute des alias français (nom, prenom, telephone) utilisés par les composants
function withAliases(user) {
  if (!user) return null;
  const parts = (user.full_name || "").trim().split(" ");
  return {
    ...user,
    prenom: parts[0] || "",
    nom: parts.slice(1).join(" "),
    telephone: user.phone || "",
  };
}

// 2. Provider
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recharger la session depuis le localStorage au démarrage
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      setSession(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const saveSession = (data) => {
    setSession(data);
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  };

  // Connexion via l'API
  const login = async (email, password) => {
    try {
      const { user, token } = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      saveSession({ user, token });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Inscription via l'API (connecte directement l'utilisateur)
  const register = async ({ nom, prenom, email, telephone, password }) => {
    try {
      const { user, token } = await apiFetch("/auth/register", {
        method: "POST",
        body: {
          fullName: `${prenom} ${nom}`.trim(),
          email,
          phone: telephone,
          password,
        },
      });
      saveSession({ user, token });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Déconnexion
  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user: withAliases(session?.user),
        token: session?.token ?? null,
        isAuthenticated: !!session,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook personnalisé
export const useAuth = () => {
  return useContext(AuthContext);
};
