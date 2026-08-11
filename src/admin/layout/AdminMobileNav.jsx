import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Car, CreditCard, Gauge, LogOut, ReceiptText, Settings, ShoppingCart, UserRoundCheck } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useLang } from "../../lib/i18n";

const mobileNavigation = [
  { key: "admin.nav.dashboard", href: "/admin", icon: Gauge },
  { key: "admin.nav.cars", href: "/admin/cars", icon: Car },
  { key: "admin.nav.owners", href: "/admin/owners", icon: UserRoundCheck },
  { key: "admin.nav.bookings", href: "/admin/bookings", icon: BarChart3 },
  { key: "admin.nav.purchases", href: "/admin/purchases", icon: ShoppingCart },
  { key: "admin.nav.payments", href: "/admin/payments", icon: CreditCard },
  { key: "admin.nav.receipts", href: "/admin/receipts", icon: ReceiptText },
  { key: "admin.nav.settings", href: "/admin/settings", icon: Settings },
];

export default function AdminMobileNav() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-3xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/90 shadow-2xl shadow-black/20 dark:shadow-black/60 backdrop-blur-xl transition-colors duration-300 lg:hidden">
      <div className="flex items-stretch gap-1 overflow-x-auto px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {mobileNavigation.map((item) => (
          <NavLink
            key={item.key}
            to={item.href}
            end={item.href === "/admin"}
            className={({ isActive }) =>
              `flex min-w-[4.2rem] flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[0.65rem] font-semibold transition ${
                isActive ? "bg-gradient-to-r from-red-600 to-orange-500 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {t(item.key)}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/admin/login", { replace: true });
          }}
          className="flex min-w-[4.2rem] flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[0.65rem] font-semibold text-gray-500 dark:text-gray-400 transition hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          {t("admin.nav.logout")}
        </button>
      </div>
    </nav>
  );
}
