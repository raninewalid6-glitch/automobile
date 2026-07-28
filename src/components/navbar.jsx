import { useAuth } from "../context/userContext";
import { useNavigate, Link, useLocation } from "react-router-dom"; // ← ajoute useLocation
import { Menu, User, X } from "lucide-react";
import React, { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Nos Voitures" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function Navbar({ setShowLoginModal }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation(); // ← récupère le pathname actuel
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Retourne les classes selon si le lien est actif ou non
  const navLinkClass = (path) =>
    location.pathname === path
      ? "relative text-red-600 dark:text-red-400 font-semibold after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-red-500 after:rounded-full"
      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition";

  return (
    <nav className="fixed w-full bg-white/95 dark:bg-black/95 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">D</span>
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">Djib Drive</div>
              <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">Premium Dealership</div>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={navLinkClass(link.to)}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link to="/mes-reservations" className={navLinkClass("/mes-reservations")}>
                Mes réservations
              </Link>
            )}
          </div>

          {/* Auth + ThemeToggle */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Bonjour, {user?.prenom}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600/20 border border-red-600/30 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-600/30 transition"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition"
              >
                <User className="w-4 h-4" />
                <span>Se connecter</span>
              </button>
            )}
            <button
              className="lg:hidden shrink-0 text-gray-700 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 py-4 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-2 py-2 ${navLinkClass(link.to)}`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/mes-reservations"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-2 py-2 ${navLinkClass("/mes-reservations")}`}
              >
                Mes réservations
              </Link>
            )}

            <div className="md:hidden pt-2 border-t border-gray-200 dark:border-gray-800">
              {isAuthenticated ? (
                <div className="flex items-center justify-between px-2 py-2 gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    Bonjour, {user?.prenom}
                  </span>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="shrink-0 px-4 py-2 bg-red-600/20 border border-red-600/30 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-600/30 transition"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowLoginModal(true);
                  }}
                  className="flex items-center space-x-2 px-2 py-2 w-full text-left font-semibold text-red-600 dark:text-red-400"
                >
                  <User className="w-4 h-4" />
                  <span>Se connecter</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;