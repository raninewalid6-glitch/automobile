import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminMobileNav from "./AdminMobileNav";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_30%)]" />
      <AdminSidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
      <div className="relative lg:pl-72">
        <AdminTopbar onMobileMenuOpen={() => setIsMobileSidebarOpen(true)} />
        <main className="px-4 py-5 pb-28 sm:px-5 sm:py-6 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <AdminMobileNav />
    </div>
  );
}
