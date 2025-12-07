import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/hooks/use-toast";
import Onboarding from "@/pages/Onboarding";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Layout from "@/components/Layout";
import "./App.css";
import { useTheme } from "@/hooks/use-theme";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { Navigate } from "react-router-dom";

const noLayoutRoutes = ["/onboarding", "/login", "/register"];

// ======================================
// LOGOUT BUTTON — Pindah ke komponen khusus
// ======================================
function LogoutButton() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("transactions_cache_v3");
    navigate("/login", { replace: true });
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-2 rounded-lg bg-red-500 text-white font-semibold shadow"
    >
      Logout
    </button>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

// AFTER const hideLayout = ...

const hasOnboarding = localStorage.getItem("onboarding_data");

// kalau user belum onboarding → paksa ke /onboarding
if (!hasOnboarding && location.pathname !== "/onboarding") {
  return <Navigate to="/onboarding" replace />;
}

  return (
    <>
  <ToastProvider>
    <Toaster />

    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
              <Index />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </ToastProvider>
</>
  );
}