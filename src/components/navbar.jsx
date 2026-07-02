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
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">Djib Drive</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Premium Dealership</div>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={navLinkClass(link.to)}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth + ThemeToggle */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
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
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition"
              >
                <User className="w-4 h-4" />
                <span>Se connecter</span>
              </button>
            )}
            <button
              className="lg:hidden text-gray-700 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 py-4 space-y-3">
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
            {!isAuthenticated && (
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
        )}
      </div>
    </nav>
  );
}

export default Navbar;