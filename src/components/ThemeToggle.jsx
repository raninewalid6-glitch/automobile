import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import React from "react";

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Changer le thème"
      className="relative w-10 h-10 rounded-full flex items-center justify-center
        bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20
        border border-black/20 dark:border-white/20
        transition-all duration-300"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-orange-400 transition-transform duration-300 rotate-0" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700 transition-transform duration-300" />
      )}
    </button>
  );
}