import { createContext, useContext, useState } from "react";
import React from "react";
import { apiFetch } from "../../lib/api";

const ADMIN_SESSION_KEY = "admin_session";
const ADMIN_ROLES = ["SUPERADMIN", "MANAGER"];

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    try {
      const { user, token } = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (!ADMIN_ROLES.includes(user.role)) {
        return { success: false, message: "Ce compte n'a pas accès à l'administration" };
      }

      const next = { user, token };
      setSession(next);
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(next));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Connexion impossible" };
    }
  };

  const logout = () => {
    setSession(null);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser: session?.user ?? null,
        token: session?.token ?? null,
        isAdminAuthenticated: !!session,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
