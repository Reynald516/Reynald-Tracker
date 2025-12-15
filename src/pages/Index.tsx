// src/pages/Index.tsx

import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/use-transaction";
import { useState, useMemo, useEffect } from "react";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import Layout from "@/components/Layout";
import LineHarian from "@/components/Charts/LineHarian";
import BarBulanan from "@/components/Charts/BarBulanan";
import PieKategori from "@/components/Charts/PieKategori";
import { usePsychologyEngine } from "@/hooks/use-psychology-engine";
import { supabase } from "@/lib/supabase";
import { useEmotionalBaseline } from "@/hooks/use-emotional-baseline";

export default function Index() {
  const { addToast } = useToast();
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const { loading, insight } = usePsychologyEngine();

  // ==========================
  // DAILY EMOTION LOGGER STATE (NEW)
  // ==========================
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const [emotionType, setEmotionType] = useState("");
  const [emotionIntensity, setEmotionIntensity] = useState<number | null>(null);
  const [todayEmotion, setTodayEmotion] = useState<any>(null);

  // ==========================
  // FILTER STATE
  // ==========================
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const now = new Date();

  const { baseline, loading: baselineLoading } = useEmotionalBaseline();

  // ==========================
  // TOTALS (NEW!)
  // ==========================

  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return (
          t.type === "income" &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return (
          t.type === "expense" &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const netBalance = totalIncome - totalExpense;

  // ==========================
  // FILTERED TRANSACTIONS
  // ==========================
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);

      const okKategori =
        filterCategory === "Semua" || t.category === filterCategory;
      const okFrom = !filterFrom || d >= new Date(filterFrom);
      const okTo = !filterTo || d <= new Date(filterTo);

      return okKategori && okFrom && okTo;
    });
  }, [transactions, filterCategory, filterFrom, filterTo]);

  // ==========================
  // MINI STATISTICS
  // ==========================
  const totalTransaksi = filteredTransactions.length;

  const avgHarian = useMemo(() => {
    if (totalExpense === 0) return 0;
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.round(totalExpense / days);
  }, [totalExpense]);

  const kategoriTerbanyak = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    let maxCat = "-";
    let maxVal = 0;

    Object.entries(map).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxCat = cat;
        maxVal = val;
      }
    });

    return maxCat;
  }, [filteredTransactions]);

  // ==========================
  // INSIGHT FINANCIAL
  // ==========================
  const insightFin = useMemo(() => {
    if (filteredTransactions.filter(t => t.type === "expense").length === 0) {
      return "Belum ada data untuk dianalisis.";
    }

    if (kategoriTerbanyak !== "-" && totalExpense > 0) {
      return `Pengeluaran terbesar bulan ini berasal dari kategori ${kategoriTerbanyak}. Mengurangi 15–20% bisa menghemat sekitar ${formatRupiah(
        Math.round(totalExpense * 0.2)
      )}.`;
    }

    return "Pengeluaranmu stabil, lanjutkan kebiasaan baik ini!";
  }, [filteredTransactions, kategoriTerbanyak, totalExpense]);

  // ==========================
  // HANDLE SUBMIT
  // ==========================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;

    const type = (f.elements.namedItem("type") as HTMLSelectElement).value;
    const amount = Number((f.elements.namedItem("amount") as HTMLInputElement).value);
    const category = (f.elements.namedItem("category") as HTMLSelectElement).value;
    const description = (f.elements.namedItem("description") as HTMLInputElement).value;
    const date = (f.elements.namedItem("date") as HTMLInputElement).value;

    const emotion = (f.elements.namedItem("emotion") as HTMLSelectElement).value;
    const intensity = Number((f.elements.namedItem("intensity") as HTMLInputElement).value);

    // INSERT TRANSAKSI
    const trx = await addTransaction({
      amount,
      category,
      description,
      date,
      type,
      notes: null,
    });

    if (!trx || !trx.id) {
      addToast({ title: "Error", description: "Gagal menambah transaksi." });
      return;
    }

    // INSERT EMOTION
    await supabase.from("transaction_emotions").insert({
      user_id: trx.user_id,
      transaction_id: trx.id,
      emotion_type: emotion,
      intensity,
      date,
    });

    addToast({
      title: "Berhasil!",
      description: "Transaksi + Emosi tersimpan 🚀",
    });

    f.reset();
  };

  const resetFilter = () => {
    setFilterCategory("Semua");
    setFilterFrom("");
    setFilterTo("");
  };

  // ==========================
  // DAILY EMOTION LOGGER LOGIC (NEW)
  // ==========================
  const todayISO = new Date().toISOString().slice(0, 10);

  async function fetchTodayEmotion() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("daily_emotions")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayISO)
      .maybeSingle();

    if (error) {
      console.error("fetchTodayEmotion error:", error);
      return;
    }

    setTodayEmotion(data || null);
  }

  const [savingEmotion, setSavingEmotion] = useState(false);

  async function saveTodayEmotion() {
    if (savingEmotion) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("User belum login!");

    if (!emotionType || !emotionIntensity) return;

    setSavingEmotion(true);

    // UPSERT: kalau hari ini sudah ada, update. kalau belum ada, insert.
    const payload = {
      user_id: user.id,
      emotion_type: emotionType,
      intensity: emotionIntensity,
      date: todayISO,
    };

    // NOTE: upsert butuh unique constraint (user_id, date) kalau mau bener-bener strict.
    // Kalau belum ada constraint, ini masih bisa jalan tapi bisa duplikat kalau user spam klik.
    const { error } = await supabase
      .from("daily_emotions")
      .upsert(payload, { onConflict: "user_id,date" });

    setSavingEmotion(false);

    if (error) {
      console.error("saveTodayEmotion error:", error);
      alert("Gagal menyimpan emosi harian.");
      return;
    }

    setShowEmotionModal(false);
    setEmotionType("");
    setEmotionIntensity(null);
    fetchTodayEmotion();
  }

  useEffect(() => {
    fetchTodayEmotion();
  }, []);

  // ==========================
  // UI RETURN
  // ==========================
  return (
    <Layout>
      <div className="space-y-12 pb-24">

        {/* TITLE */}
        <h1 className="dashboard-title">
          ReynaldTrack — Psychological Dashboard
        </h1>

        {/* DAILY EMOTION LOGGER (NEW) */}
        <div className="section-card">
          <h2 className="text-xl font-semibold mb-3">Mood Hari Ini</h2>
          
          {todayEmotion ? (
            <p className="text-lg">
              {todayEmotion.emotion_type} ({todayEmotion.intensity}/10)
            </p>
          ) : (
            <p className="opacity-70">Belum ada mood hari ini.</p>
          )}
          
          <button
            onClick={() => setShowEmotionModal(true)}
            className="mt-4 w-full bg-purple-600 text-white py-3 rounded-xl font-semibold"
          >
            Bagaimana perasaanmu hari ini?
          </button>
        </div>

        {/* NEW 3 SUMMARY BOXES */}
        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="section-card text-center">
            <p className="text-sm opacity-70">Total Pemasukan Bulan Ini</p>
            <p className="text-xl font-bold text-green-400">
              {formatRupiah(totalIncome)}
            </p>
          </div>

          <div className="section-card text-center">
            <p className="text-sm opacity-70">Total Pengeluaran Bulan Ini</p>
            <p className="text-xl font-bold text-red-400">
              {formatRupiah(totalExpense)}
            </p>
          </div>

          <div className="section-card text-center">
            <p className="text-sm opacity-70">Saldo Bersih (Income - Expense)</p>
            <p className="text-xl font-bold text-blue-400">
              {formatRupiah(netBalance)}
            </p>
          </div>

        </div>

        {/* INSIGHT FINANCIAL */}
        <div className="insight-box">
          <div className="insight-emoji">💰</div>
          <div>
            <h3 className="font-semibold mb-1">Insight Finansial</h3>
            <p>{insightFin}</p>
          </div>
        </div>

        {/* INSIGHT PSYKOLOGI */}
        <div className="insight-box">
          <div className="insight-emoji">🧠</div>
          <div>
            <h3 className="font-semibold mb-1">Insight Psikologi Uang (AI)</h3>

            {loading && <p className="opacity-70">Menganalisis pola emosionalmu...</p>}

            {!loading && insight && (
              <>
                <p className="font-medium">{insight.summary}</p>
                <p className="opacity-70 mt-2">
                  Emosi dominan: <b>{insight.dominantEmotion || "-"}</b>
                </p>
                <p className="opacity-70">
                  Intensitas rata-rata: <b>{insight.avgIntensity}</b>
                </p>
              </>
            )}

            {!loading && !insight && (
              <p className="opacity-70">
                Belum ada data emosional. Tambahkan emosi pada transaksi untuk melihat insight AI.
              </p>
            )}
          </div>
        </div>

        <div className="section-card">
          <h2 className="text-lg font-semibold">Emotional Baseline (14 Hari)</h2>
          {baselineLoading && <p className="opacity-70">Menghitung baseline emosional...</p>}
          
          {!baselineLoading && baseline && (
            <>
              <p className="text-3xl font-bold">{baseline.baseline_score}/100</p>
              <p className="opacity-70 mt-2">{baseline.summary}</p>
            </>
          )}
          
          {!baselineLoading && !baseline && (
            <p className="opacity-70">
              Baseline emosional akan terbentuk setelah 14 hari data.
            </p>
          )}
        </div>
        
        {/* FILTER BAR */}
        <div className="filter-card">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 rounded text-black"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Makan">Makan</option>
            <option value="Transport">Transport</option>
            <option value="Belanja">Belanja</option>
            <option value="Lainnya">Lainnya</option>
          </select>

          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="p-2 rounded text-black"
          />

          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="p-2 rounded text-black"
          />

          <button
            onClick={resetFilter}
            className="bg-red-500 text-white rounded px-4 font-semibold"
          >
            Reset
          </button>
        </div>

        {/* FORM */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="section-card">
            <h2 className="text-xl font-semibold mb-4">Tambah Transaksi</h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* NEW FIELD: TYPE */}
              <select name="type" className="p-2 w-full rounded text-black" required>
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>

              <input type="number" name="amount" placeholder="Jumlah (contoh: 50000)" className="p-2 w-full rounded text-black" required />

              <select name="category" className="p-2 w-full rounded text-black" required>
                <option value="">Pilih kategori</option>
                <option value="Makan">Makan</option>
                <option value="Transport">Transport</option>
                <option value="Belanja">Belanja</option>
                <option value="Lainnya">Lainnya</option>
              </select>

              <input type="text" name="description" placeholder="Deskripsi" className="p-2 w-full rounded text-black" required />

              <select name="emotion" className="p-2 w-full rounded text-black" required>
                <option value="">Pilih Emosi</option>
                <option value="CALM">Tenang</option>
                <option value="HAPPY">Senang</option>
                <option value="STRESSED">Stres</option>
                <option value="SAD">Sedih</option>
                <option value="IMPULSIVE">Impulsif</option>
                <option value="BORED">Bosan</option>
              </select>

              <input type="number" name="intensity" min={1} max={10} placeholder="Intensitas Emosi (1–10)" className="p-2 w-full rounded text-black" required />

              <input type="date" name="date" className="p-2 w-full rounded text-black" required />

              <button type="submit" className="px-4 py-2 bg-primary text-white rounded font-semibold w-full">
                Tambah
              </button>
            </form>
          </div>

          {/* PIE CHART */}
          <div className="section-card">
            <h2 className="text-xl font-semibold mb-3">Persentase Pengeluaran per Kategori</h2>
            <PieKategori transactions={filteredTransactions.filter(t => t.type === "expense")} />
          </div>
        </div>

        {/* LINE CHART */}
        <div className="section-card">
          <h2 className="text-xl font-semibold mb-4">Pengeluaran 7 Hari Terakhir</h2>
          <LineHarian transactions={filteredTransactions.filter(t => t.type === "expense")} />
        </div>

        {/* BAR CHART */}
        <div className="section-card">
          <h2 className="text-xl font-semibold mb-4">Pengeluaran 12 Bulan Terakhir</h2>
          <BarBulanan transactions={filteredTransactions.filter(t => t.type === "expense")} />
        </div>

        {/* LIST */}
        <div className="section-card">
          <h2 className="text-xl font-semibold mb-4">Daftar Transaksi</h2>

          {filteredTransactions.length === 0 ? (
            <p className="opacity-70">Tidak ada transaksi ditemukan.</p>
          ) : (
            <ul className="space-y-4">
              {filteredTransactions.map((t) => (
                <li key={t.id} className="bg-white/10 p-4 rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {t.type === "income" ? "🟢 Income" : "🔴 Expense"} — {t.category}
                    </p>
                    <p>{t.description}</p>
                    <p className="text-sm opacity-70">{formatTanggal(t.date)}</p>
                    <p className={t.type === "income" ? "text-green-400" : "text-red-400"}>
                      {formatRupiah(t.amount)}
                    </p>
                  </div>

                  <button className="text-red-400 font-bold" onClick={() => deleteTransaction(t.id)}>
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* EMOTION MODAL (NEW) */}
        {showEmotionModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white text-black p-6 rounded-2xl w-full max-w-sm space-y-4">
              <h2 className="text-xl font-bold text-center">
                Perasaanmu hari ini?
              </h2>
              
              <div className="grid grid-cols-3 gap-3 text-3xl">
                {[
                  { label: "😄", value: "HAPPY" },
                  { label: "🙂", value: "CALM" },
                  { label: "😣", value: "STRESSED" },
                  { label: "😞", value: "SAD" },
                  { label: "⚡", value: "IMPULSIVE" },
                  { label: "😴", value: "BORED" },
                ].map((emo) => (
                <button
                key={emo.value}
                onClick={() => setEmotionType(emo.value)}
                className={`p-3 rounded-xl border ${
                  emotionType === emo.value ? "bg-purple-500 text-white" : "bg-gray-100"
                }`}
              >
                {emo.label}
              </button>
              ))}
            </div>
          
          <input
            type="number"
            min={1}
            max={10}
            value={emotionIntensity ?? ""}
            onChange={(e) => setEmotionIntensity(Number(e.target.value))}
            placeholder="Intensitas (1–10)"
            className="w-full p-3 rounded-lg border"
          />
          
          <button
            onClick={saveTodayEmotion}
            disabled={savingEmotion || !emotionType || !emotionIntensity}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {savingEmotion ? "Menyimpan..." : "Simpan"}
          </button>
          
          <button
            onClick={() => setShowEmotionModal(false)}
            className="w-full text-sm opacity-60"
          >
            Batal
          </button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}