import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [emotion, setEmotion] = useState("");

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const finishOnboarding = () => {
    const data = { name, goal, emotion };

    localStorage.setItem("onboarding_data", JSON.stringify(data));
    localStorage.setItem("seen_onboarding", "true");

    navigate("/register");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center">

      {/* STEP 1 */}
      {step === 1 && (
  <>
    {/* LOGO */}
    <img
      src="/logo.png"
      alt="Reynald Intelligence Logo"
      className="w-24 h-24 mb-6 opacity-90"
    />

    {/* TITLE */}
    <h1 className="text-3xl font-extrabold mb-3">
      Selamat Datang di ReynaldTrack
    </h1>

    {/* SUBTITLE */}
    <p className="opacity-80 max-w-sm mb-8">
      Salah satu produk unggulan dari <span className="font-semibold">Reynald Intelligence</span>.
      Aplikasi ini membantumu memahami pola keuangan, emosi pengeluaran, dan mendapatkan insight AI yang personal.
    </p>

    {/* QUESTION */}
    <h2 className="text-xl font-bold mb-3">Siapa nama kamu?</h2>

    {/* INPUT */}
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      type="text"
      placeholder="Masukkan nama kamu"
      className="p-3 rounded-lg w-full max-w-xs text-black mb-6"
    />

    {/* BUTTON */}
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