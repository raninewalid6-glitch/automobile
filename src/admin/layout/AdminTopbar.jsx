import React from "react";
import { Bell, Menu, Search, ShieldCheck } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";

export default function AdminTopbar({ onMobileMenuOpen }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-colors duration-300">
      <div className="flex min-h-20 items-center justify-between gap-4 px-5 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3 text-gray-600 dark:text-gray-300 transition hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white lg:hidden"
            onClick={onMobileMenuOpen}
            aria-label="Ouvrir la sidebar admin"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-300">
              <ShieldCheck className="h-4 w-4" /> Espace Admin / SuperAdmin
            </p>
            <h1 className="mt-1 text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">DriveUp Admin</h1>
          </div>
        </div>

        <div className="md:hidden">
          <ThemeToggle />
        </div>

        <div className="hidden flex-1 justify-end gap-3 md:flex">
          <label className="flex max-w-sm flex-1 items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-gray-500 dark:text-gray-400">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="Rechercher une voiture, réservation..."
              type="search"
            />
          </label>
          <button className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3 text-gray-600 dark:text-gray-300 transition hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white">
            <Bell className="h-5 w-5" />
          </button>
          <ThemeToggle />
          <div className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-sm font-black text-white shadow-lg shadow-red-600/25">D</div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">DriveUp Admin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">SuperAdmin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
