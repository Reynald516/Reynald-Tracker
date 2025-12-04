// src/pages/auth/Login.tsx
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/Layout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Login gagal: " + error.message);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <Layout>
      <div className="text-center space-y-8">
        <h1 className="text-3xl font-bold">Masuk ke ReynaldTrack</h1>
        <p className="opacity-80">Masukkan email dan password kamu</p>

        <form
          onSubmit={handleLogin}
          className="bg-white/10 dark:bg-white/5 p-6 rounded-xl space-y-4 max-w-sm mx-auto"
        >
          <input
            type="email"
            className="p-3 rounded w-full text-black"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="p-3 rounded w-full text-black"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white p-3 rounded w-full font-semibold"
          >
            {loading ? "Masuk..." : "Login"}
          </button>
        </form>

        <p className="mt-4">
          Belum punya akun?{" "}
          <a href="/register" className="text-blue-400 font-semibold">
            Daftar di sini
          </a>
        </p>
      </div>
    </Layout>
  );
}