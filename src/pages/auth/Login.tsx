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

    // 1) LOGIN USER
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login gagal: " + error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      alert("Login gagal: user tidak ditemukan.");
      setLoading(false);
      return;
    }

    // 2) Cek apakah profile sudah ada
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    // 3) Kalau belum ada → buat
    if (!existingProfile) {
      const { error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            user_id: user.id,
            onboarding_completed: false,
          },
        ]);

      if (createError) {
        alert("Gagal membuat profile: " + createError.message);
        setLoading(false);
        return;
      }
    }

    // 4) Arahkan ke onboarding
    window.location.href = "/";
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
            className="bg-blue-500 text-white p-3 rounded w-full font-semibold"
          >
            {loading ? "Masuk..." : "Masuk"}
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