import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Car,
  CreditCard,
  Gauge,
  LogOut,
  ReceiptText,
  Settings,
  ShoppingCart,
  UserRoundCheck,
  X,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useLang } from "../../lib/i18n";

const navigation = [
  { key: "admin.nav.dashboard", href: "/admin", icon: Gauge },
  { key: "admin.nav.cars", href: "/admin/cars", icon: Car },
  { key: "admin.nav.owners", href: "/admin/owners", icon: UserRoundCheck },
  { key: "admin.nav.bookings", href: "/admin/bookings", icon: BarChart3 },
  { key: "admin.nav.purchases", href: "/admin/purchases", icon: ShoppingCart },
  { key: "admin.nav.payments", href: "/admin/payments", icon: CreditCard },
  { key: "admin.nav.receipts", href: "/admin/receipts", icon: ReceiptText },
  { key: "admin.nav.settings", href: "/admin/settings", icon: Settings },
];

function SidebarContent({ onNavigate, showCloseButton = false }) {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const { t } = useLang();

  const handleLogout = () => {
    logout();
    onNavigate?.();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex min-h-full flex-col px-5 py-6">
      <div className="flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 text-lg font-black text-white shadow-lg shadow-red-600/30">
            D
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">DjibDrive Admin</p>
            <p className="text-xs font-semibold tracking-[0.25em] text-gray-500 dark:text-gray-400">SuperAdmin</p>
          </div>
        </div>
        {showCloseButton && (
          <button
            type="button"
            className="rounded-2xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 transition hover:border-red-500/40 hover:text-gray-900 dark:hover:text-white"
            onClick={onNavigate}
            aria-label={t("admin.close")}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="mt-10 space-y-2" aria-label="Navigation admin">
        {navigation.map((item) => (
          <NavLink
            key={item.key}
            to={item.href}
            end={item.href === "/admin"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-600/25"
                  : "text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {t(item.key)}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400 transition hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          {t("admin.nav.logout")}
        </button>
      </nav>

      <div className="mt-auto rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-600/15 to-orange-500/10 p-5">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t("admin.sidebar.platform")}</p>
        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {t("admin.sidebar.desc")}
        </p>
      </div>
    </div>
  );
}

export default function AdminSidebar({ isMobileOpen = false, onMobileClose }) {
  return (
    <>
      <aside className="hidden min-h-screen w-72 border-r border-black/10 dark:border-white/10 bg-white/95 dark:bg-black/95 transition-colors duration-300 lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      <div className={`fixed inset-0 z-50 lg:hidden ${isMobileOpen ? "" : "pointer-events-none"}`} aria-hidden={!isMobileOpen}>
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${isMobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={onMobileClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col border-r border-black/10 dark:border-white/10 bg-white/95 dark:bg-black/95 shadow-2xl shadow-black/70 transition-transform duration-300 ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent onNavigate={onMobileClose} showCloseButton />
        </aside>
      </div>
    </>
  );
}
