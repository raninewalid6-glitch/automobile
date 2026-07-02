import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/userContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx"; // ← ajoute cet import
import { AdminAuthProvider } from "./admin/context/AdminAuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <App />
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);