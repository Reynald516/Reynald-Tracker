// src/pages/auth/Register.tsx
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/Layout";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // 1) REGISTER USER
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Register gagal: " + error.message);
      return;
    }

    // 2) JANGAN INSERT PROFILE DI SINI (karena user belum ter-auth)
    alert("Akun berhasil dibuat! Silakan cek email untuk verifikasi, lalu login.");
    window.location.href = "/login";
  }

  return (
    <Layout>
      <div className="text-center space-y-8">
        <h1 className="text-3xl font-bold">Buat Akun Baru</h1>
        <p className="opacity-80">Mulai perjalanan finansialmu sekarang</p>

        <form
          onSubmit={handleRegister}
          className="bg-white/10 dark:bg-white/5 p-6 rounded-xl space-y-4 max-w-sm mx-auto"
        >
          <input
            type="email"
            className="p-3 rounded w-full text-black"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="p-3 rounded w-full text-black"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white p-3 rounded w-full font-semibold"
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>

        <p className="mt-4">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-400 font-semibold">
            Masuk di sini
          </a>
        </p>
      </div>
    </Layout>
  );
}