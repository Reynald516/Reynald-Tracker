import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login gagal: " + error.message);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="app-shell">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4 section-card">
          <input
            type="email"
            className="p-2 rounded w-full text-black"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="p-2 rounded w-full text-black"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="bg-blue-500 text-white p-2 rounded w-full font-bold">
            Login
          </button>
        </form>

        <p className="mt-4 text-center">
          Belum punya akun? <a href="/register" className="text-blue-400">Register</a>
        </p>
      </div>
    </div>
  );
}