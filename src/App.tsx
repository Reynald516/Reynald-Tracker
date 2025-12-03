import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/hooks/use-toast";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import "./App.css";
import { useTheme } from "@/hooks/use-theme";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";

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

import { useNavigate } from "react-router-dom";

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="dashboard-container">

          {/* THEME + LOGOUT BUTTONS */}
          <div className="absolute top-4 right-4 flex gap-3">

            {/* THEME SWITCH */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/20 dark:bg-black/20 backdrop-blur-sm"
            >
              {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
            </button>

            {/* LOGOUT BUTTON (sekarang aman karena di dalam BrowserRouter) */}
            <LogoutButton />
          </div>

          <ToastProvider>
            <Toaster />

            <Routes>
              {/* AUTH PAGES */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* DASHBOARD */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>

        </div>
      </div>
    </BrowserRouter>
  );
}