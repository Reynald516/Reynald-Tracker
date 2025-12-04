import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export function LogoutButton() {
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