import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function Onboarding() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [emotion, setEmotion] = useState("");

  // =====================================================
  // 1. CEK: JIKA ROW PROFILE BELUM ADA → BUAT DULU
  // =====================================================
  useEffect(() => {
    async function ensureProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // cek profile
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // kalau belum ada → insert profile kosong
      if (!existing) {
        await supabase.from("profiles").insert({
          user_id: user.id,
          name: null,
          goal: null,
          emotion_pattern: null,
          onboarding_completed: false,
        });
      }
    }

    ensureProfile();
  }, []);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  // =====================================================
  // 2. FINISH ONBOARDING → UPDATE profile row
  // =====================================================
  const finishOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("User belum login!");

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        goal,
        emotion_pattern: emotion,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return alert("Gagal menyimpan onboarding");
    }

    navigate("/");
  };

  // =====================================================
  //  UI TIDAK DIUBAH — HANYA LOGIC DI FIX
  // =====================================================
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center">

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <img src="/logo.png" className="w-24 h-24 mb-6 opacity-90" />

          <h1 className="text-3xl font-extrabold mb-3">
            Selamat Datang di ReynaldTrack
          </h1>

          <p className="opacity-80 max-w-sm mb-8">
            Salah satu produk unggulan dari <b>Reynald Intelligence</b>.
            Aplikasi ini membantumu memahami pola keuangan, emosi pengeluaran,
            dan mendapatkan insight AI yang personal.
          </p>

          <h2 className="text-xl font-bold mb-3">Siapa nama kamu?</h2>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Masukkan nama kamu"
            className="p-3 rounded-lg w-full max-w-xs text-black mb-6"
          />

          <button
            onClick={handleNext}
            disabled={!name}
            className="w-full max-w-xs bg-blue-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            Lanjut →
          </button>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <h1 className="text-3xl font-bold mb-4">Apa tujuan finansialmu?</h1>

          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            type="text"
            placeholder="Contoh: Mengurangi pengeluaran"
            className="p-3 rounded-lg w-full max-w-xs text-black mb-6"
          />

          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-300 py-3 rounded-xl"
            >
              Kembali
            </button>

            <button
              onClick={handleNext}
              disabled={!goal}
              className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              Lanjut →
            </button>
          </div>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <h1 className="text-3xl font-bold mb-4">
            Emosi dominan saat mengeluarkan uang?
          </h1>

          <div className="grid grid-cols-3 gap-4 mb-6 text-4xl">
            {["⎈ FOCUSED", "⏻ THRILLED", "▣ DRIVEN", "◻ NEUTRAL", "⍰ ANXIOUS", "◷ DRAINED"].map((emo) => (
              <button
                key={emo}
                onClick={() => setEmotion(emo)}
                className={`p-3 rounded-xl border ${
                  emotion === emo ? "bg-blue-500" : "bg-white/20"
                }`}
              >
                {emo}
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-300 py-3 rounded-xl"
            >
              Kembali
            </button>

            <button
              onClick={finishOnboarding}
              disabled={!emotion}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              Selesai →
            </button>
          </div>
        </>
      )}
    </div>
  );
}