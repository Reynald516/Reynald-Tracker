// src/hooks/use-psychology.ts
import { useMemo } from "react";
import type { Transaction, EmotionTag } from "@/hooks/use-transaction";

type EmotionStats = {
  count: number;
  totalAmount: number;
};

type EmotionStatsMap = Record<EmotionTag, EmotionStats>;

export function usePsychologyInsights(transactions: Transaction[]) {
  const emotionStats = useMemo<EmotionStatsMap>(() => {
    const base: EmotionStatsMap = {
      Tenang: { count: 0, totalAmount: 0 },
      Senang: { count: 0, totalAmount: 0 },
      Stres: { count: 0, totalAmount: 0 },
      Sedih: { count: 0, totalAmount: 0 },
      Impulsif: { count: 0, totalAmount: 0 },
      Bosan: { count: 0, totalAmount: 0 },
    };

    for (const t of transactions) {
      if (!t.emotion) continue;
      const bucket = base[t.emotion];
      bucket.count += 1;
      bucket.totalAmount += t.amount;
    }

    return base;
  }, [transactions]);

  const totalWithEmotion = useMemo(
    () => Object.values(emotionStats).reduce((acc, e) => acc + e.count, 0),
    [emotionStats]
  );

  const dominantEmotion: EmotionTag | null = useMemo(() => {
    if (!totalWithEmotion) return null;
    let best: EmotionTag | null = null;
    let bestAmount = 0;

    (Object.keys(emotionStats) as EmotionTag[]).forEach((key) => {
      const { totalAmount } = emotionStats[key];
      if (totalAmount > bestAmount) {
        bestAmount = totalAmount;
        best = key;
      }
    });

    return best;
  }, [emotionStats, totalWithEmotion]);

  const impulsiveScore = useMemo(() => {
    const impulsif = emotionStats.Impulsif;
    const stres = emotionStats.Stres;
    const calm = emotionStats.Tenang;
    const total = totalWithEmotion || 1;

    const riskyCount = impulsif.count + stres.count;
    const ratio = riskyCount / total;

    const avgRisk =
      riskyCount === 0 ? 0 : (impulsif.totalAmount + stres.totalAmount) / riskyCount;
    const avgCalm =
      calm.count === 0 ? 0 : calm.totalAmount / calm.count;

    return {
      ratio,
      avgRisk,
      avgCalm,
    };
  }, [emotionStats, totalWithEmotion]);

  const hasData = transactions.length > 0;

  const psychologySummary = useMemo(() => {
    if (!hasData) {
      return {
        primary: "Belum ada data untuk dianalisis.",
        secondary: "Coba catat beberapa transaksi dan tandai emosinya.",
      };
    }

    const lines: string[] = [];

    if (dominantEmotion) {
      lines.push(
        `Secara total, pengeluaranmu paling besar terjadi saat kamu merasa ${dominantEmotion.toLowerCase()}.`
      );
    }

    if (impulsiveScore.ratio > 0.4 && impulsiveScore.avgRisk > impulsiveScore.avgCalm * 1.2) {
      lines.push(
        "Proporsi belanja saat kamu stres/impulsif cukup tinggi. Ini pola klasik emotional spending — mungkin perlu jeda sebelum checkout."
      );
    } else if (impulsiveScore.ratio > 0.25) {
      lines.push(
        "Belanja saat emosi negatif mulai sering muncul. Bagus kalau kamu mulai sadar trigger-nya sekarang."
      );
    } else {
      lines.push(
        "Secara emosional, keputusan finansialmu cenderung stabil. Pertahankan awareness ini."
      );
    }

    if (!dominantEmotion) {
      lines.unshift(
        "Belum banyak transaksi dengan tag emosi. Makin konsisten kamu tag, makin tajam insight psikologinya."
      );
    }

    return {
      primary: lines[0],
      secondary: lines[1] ?? null,
    };
  }, [hasData, dominantEmotion, impulsiveScore]);

  return {
    hasData,
    emotionStats,
    dominantEmotion,
    impulsiveScore,
    psychologySummary,
  };
}
