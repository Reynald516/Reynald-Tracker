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
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";

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

  // ==========================
  // ALL HOOKS MUST ALWAYS RUN
  // ==========================
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  // Saat loading → TIDAK RENDER APA PUN
  if (authLoading || profileLoading) return null;

  // ALLOW routes saat user belum login
const publicRoutes = ["/login", "/register", "/onboarding"];

// 1) User BELUM login
if (!user) {
  // boleh ke login/register/onboarding
  if (!publicRoutes.includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }
}

// 2) User SUDAH login tapi belum onboarding
if (user && profile && !profile.onboarding_completed) {
  if (location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
}

  // ========================================
  // RENDER ROUTES NORMAL
  // ========================================
  return (
    <ToastProvider>
      <Toaster />

      <Routes>
        {/* PUBLIC */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PRIVATE */}
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
  );
}