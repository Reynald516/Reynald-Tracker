// src/pages/Index.tsx

import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/use-transaction";
import { useState, useMemo } from "react";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import Layout from "@/components/Layout";
import LineHarian from "@/components/Charts/LineHarian";
import BarBulanan from "@/components/Charts/BarBulanan";
import PieKategori from "@/components/Charts/PieKategori";


export default function Index() {
  const { addToast } = useToast();
  const { transactions, addTransaction, deleteTransaction } = useTransactions();

  // ==========================
  // FILTER STATE
  // ==========================
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const now = new Date();

  // ==========================
  // TOTAL BULAN INI
  // ==========================
  const totalBulanan = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

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
    if (totalBulanan === 0) return 0;
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.round(totalBulanan / days);
  }, [totalBulanan]);

  const kategoriTerbanyak = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
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
    if (filteredTransactions.length === 0) {
      return "Belum ada data untuk dianalisis.";
    }

    if (kategoriTerbanyak !== "-" && totalBulanan > 0) {
      return `Pengeluaran terbesar bulan ini berasal dari kategori ${kategoriTerbanyak}. Mengurangi 15–20% bisa menghemat sekitar ${formatRupiah(
        Math.round(totalBulanan * 0.2)
      )}.`;
    }

    return "Pengeluaranmu stabil, lanjutkan kebiasaan baik ini!";
  }, [filteredTransactions, kategoriTerbanyak, totalBulanan]);

  // ==========================
  // INSIGHT PSYCHOLOGICAL
  // ==========================
  const insightPsycho =
    filteredTransactions.length === 0
      ? "Belum ada data untuk dianalisis. Coba catat beberapa transaksi dan tandai emosinya."
      : "Polamu menunjukkan kecenderungan tertentu dalam pengeluaran. Identifikasi pemicu emosional bisa meningkatkan kontrol finansial.";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;

    addTransaction({
  amount: Number((f.elements.namedItem("amount") as HTMLInputElement).value),
  category: (f.elements.namedItem("category") as HTMLSelectElement).value,
  description: (f.elements.namedItem("description") as HTMLInputElement).value,
  date: (f.elements.namedItem("date") as HTMLInputElement).value,
  type: "expense", // default, nanti bisa ubah ke "income" untuk pemasukan
  notes: null
});

    addToast({
      title: "Berhasil!",
      description: "Transaksi berhasil ditambahkan 🚀",
    });

    f.reset();
  };

  const resetFilter = () => {
    setFilterCategory("Semua");
    setFilterFrom("");
    setFilterTo("");
  };

  // ==========================
  // UI
  // ==========================
  return (
    <Layout>
      <div className="space-y-12 pb-24">

        {/* TITLE */}
        <h1 className="dashboard-title">
          ReynaldTrack — Psychological Dashboard
        </h1>

        {/* TOTAL BULAN INI */}
        <div className="section-card text-center">
          <h2 className="text-lg font-medium opacity-80 mb-2">
            TOTAL BULAN INI
          </h2>
          <p className="text-4xl font-bold text-green-500">
            {formatRupiah(totalBulanan)}
          </p>
        </div>

        {/* MINI STATS */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="section-card text-center">
            <p className="text-sm opacity-70">Rata-rata Harian</p>
            <p className="text-xl font-bold">{formatRupiah(avgHarian)}</p>
          </div>

          <div className="section-card text-center">
            <p className="text-sm opacity-70">Kategori Terboros</p>
            <p className="text-xl font-bold">{kategoriTerbanyak}</p>
          </div>

          <div className="section-card text-center">
            <p className="text-sm opacity-70">Total Transaksi</p>
            <p className="text-xl font-bold">{totalTransaksi}x</p>
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

        {/* INSIGHT PSYCHOLOGY */}
        <div className="insight-box">
          <div className="insight-emoji">🧠</div>
          <div>
            <h3 className="font-semibold mb-1">Insight Psikologi Uang</h3>
            <p>{insightPsycho}</p>
          </div>
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

        {/* FORM + PIE */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* FORM */}
          <div className="section-card">
            <h2 className="text-xl font-semibold mb-4">Tambah Transaksi</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="number"
                name="amount"
                placeholder="Jumlah (contoh: 50000)"
                className="p-2 w-full rounded text-black"
                required
              />

              <select
                name="category"
                className="p-2 w-full rounded text-black"
                required
              >
                <option value="">Pilih kategori</option>
                <option value="Makan">Makan</option>
                <option value="Transport">Transport</option>
                <option value="Belanja">Belanja</option>
                <option value="Lainnya">Lainnya</option>
              </select>

              <input
                type="text"
                name="description"
                placeholder="Deskripsi"
                className="p-2 w-full rounded text-black"
                required
              />

              <input
                type="date"
                name="date"
                className="p-2 w-full rounded text-black"
                required
              />

              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded font-semibold w-full"
              >
                Tambah
              </button>
            </form>
          </div>

          {/* PIE CHART */}
          <div className="section-card">
            <h2 className="text-xl font-semibold mb-3">
              Persentase Pengeluaran per Kategori
            </h2>
            <PieKategori transactions={filteredTransactions} />
          </div>
        </div>

        {/* LINE CHART */}
        <div className="section-card">
          <h2 className="text-xl font-semibold mb-4">
            Pengeluaran 7 Hari Terakhir
          </h2>
          <LineHarian transactions={filteredTransactions} />
        </div>

        {/* BAR CHART */}
        <div className="section-card">
          <h2 className="text-xl font-semibold mb-4">
            Pengeluaran 12 Bulan Terakhir
          </h2>
          <BarBulanan transactions={filteredTransactions} />
        </div>

        {/* LIST */}
        <div className="section-card">
          <h2 className="text-xl font-semibold mb-4">Daftar Transaksi</h2>

          {filteredTransactions.length === 0 ? (
            <p className="opacity-70">Tidak ada transaksi ditemukan.</p>
          ) : (
            <ul className="space-y-4">
              {filteredTransactions.map((t) => (
                <li
                  key={t.id}
                  className="bg-white/10 dark:bg-white/5 p-4 rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{t.category}</p>
                    <p>{t.description}</p>
                    <p className="text-sm opacity-70">
                      {formatTanggal(t.date)}
                    </p>
                    <p className="text-green-400 font-medium">
                      {formatRupiah(t.amount)}
                    </p>
                  </div>

                  <button
                    className="text-red-400 font-bold"
                    onClick={() => deleteTransaction(t.id)}
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </Layout>
  );
}