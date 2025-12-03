import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Register gagal: " + error.message);
    } else {
      alert("Berhasil! Silakan cek email untuk verifikasi.");
      window.location.href = "/login";
    }
  }

  return (
    <div className="app-shell">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Register</h1>

        <form onSubmit={handleRegister} className="space-y-4 section-card">
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

          <button className="bg-green-500 text-white p-2 rounded w-full font-bold">
            Register
          </button>
        </form>

        <p className="mt-4 text-center">
          Sudah punya akun? <a href="/login" className="text-blue-400">Login</a>
        </p>
      </div>
    </div>
  );
}