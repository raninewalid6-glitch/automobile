import { createContext, useContext, useState } from "react";
import React from "react";

const ADMIN_SESSION_KEY = "admin_session";

const adminCredentials = [
  { email: "admin@driveup.com", password: "admin123", role: "SuperAdmin" },
];

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email, password) => {
    const found = adminCredentials.find(
      (admin) => admin.email.toLowerCase() === email.trim().toLowerCase() && admin.password === password
    );

    if (!found) {
      return { success: false, message: "Email ou mot de passe incorrect" };
    }

    const session = { email: found.email, role: found.role };
    setAdminUser(session);
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    return { success: true };
  };

  const logout = () => {
    setAdminUser(null);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, isAdminAuthenticated: !!adminUser, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
