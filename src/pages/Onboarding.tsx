import { useNavigate } from "react-router-dom";
import { useState } from "react";

const slides = [
  {
    title: "Kenali Pola Keuanganmu",
    desc: "Lihat ke mana uangmu pergi dengan lebih jelas dan terstruktur.",
    emoji: "📊",
  },
  {
    title: "Pahami Emosi Pengeluaranmu",
    desc: "App pertama yang menganalisis emotional spending dan kebiasaanmu.",
    emoji: "🧠",
  },
  {
    title: "Mulai Perjalanan Finansialmu",
    desc: "Bangun kebiasaan finansial yang sehat dengan bantuan AI.",
    emoji: "🚀",
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (index < slides.length - 1) setIndex(index + 1);
    else navigate("/register");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center p-6 text-center">

      {/* CONTENT */}
      <div className="mt-20">
        <div className="text-6xl mb-6">{slides[index].emoji}</div>
        <h1 className="text-3xl font-bold mb-3">{slides[index].title}</h1>
        <p className="opacity-80 text-lg max-w-xs mx-auto">
          {slides[index].desc}
        </p>
      </div>

      {/* BUTTON */}
      <div className="mb-16 w-full max-w-xs">
        {index === slides.length - 1 ? (
          <>
            <button
              onClick={() => navigate("/register")}
              className="w-full bg-green-500 py-3 rounded-xl font-semibold text-lg"
            >
              Mulai
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full mt-3 py-3 rounded-xl opacity-70"
            >
              Sudah punya akun? Login
            </button>
          </>
        ) : (
          <button
            onClick={next}
            className="w-full bg-blue-500 py-3 rounded-xl font-semibold text-lg"
          >
            Lanjut →
          </button>
        )}
      </div>
    </div>
  );
}