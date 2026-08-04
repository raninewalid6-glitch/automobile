import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Home from "./pages/home";
import Cars from "./pages/car";
import Services from "./pages/services";
import About from "./pages/about";
import Contact from "./pages/contact";
import MyReservations from "./pages/myreservations";
import AdminLayout from "./admin/layout/AdminLayout";
import AdminLoginPage from "./admin/pages/AdminLoginPage";
import RequireAdminAuth from "./admin/components/RequireAdminAuth";
import DashboardPage from "./admin/pages/DashboardPage";
import CarsPage from "./admin/pages/CarsPage";
import CarFormPage from "./admin/pages/CarFormPage";
import CarDetailsPage from "./admin/pages/CarDetailsPage";
import OwnersPage from "./admin/pages/OwnersPage";
import OwnerDetailsPage from "./admin/pages/OwnerDetailsPage";
import BookingsPage from "./admin/pages/BookingsPage";
import BookingDetailsPage from "./admin/pages/BookingDetailsPage";
import PurchasesPage from "./admin/pages/PurchasesPage";
import PurchaseDetailsPage from "./admin/pages/PurchaseDetailsPage";
import PaymentsPage from "./admin/pages/PaymentsPage";
import ReceiptsPage from "./admin/pages/ReceiptsPage";
import SettingsPage from "./admin/pages/SettingsPage";
import Navbar from "./components/navbar";
import Connexion from "./components/login";
import { LanguageProvider } from "./lib/i18n";

function PublicLayout() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar setShowLoginModal={setShowLoginModal} />
      <Outlet />
      {/* ✅ Modal Connexion accessible sur toutes les pages publiques */}
      <Connexion
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        setShowReservationModal={setShowReservationModal}
      />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/mes-reservations" element={<MyReservations />} />
        </Route>
        {/* Route /login supprimée — remplacée par le modal */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdminAuth>
              <AdminLayout />
            </RequireAdminAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="cars" element={<CarsPage />} />
          <Route path="cars/new" element={<CarFormPage />} />
          <Route path="cars/:id/edit" element={<CarFormPage />} />
          <Route path="cars/:id" element={<CarDetailsPage />} />
          <Route path="owners" element={<OwnersPage />} />
          <Route path="owners/:id" element={<OwnerDetailsPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailsPage />} />
          <Route path="purchases" element={<PurchasesPage />} />
          <Route path="purchases/:id" element={<PurchaseDetailsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="receipts" element={<ReceiptsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
    </LanguageProvider>
  );
}

export default App;