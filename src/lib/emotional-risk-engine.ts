import type { EmotionalSignature } from "./emotional-signature-engine";

export type EmotionalRisk = {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  drivers: string[];
  summary: string;
  recommendedActions: string[];
};

export function buildEmotionalRisk(
  signature: EmotionalSignature
): EmotionalRisk {
  let score = 0;
  const drivers: string[] = [];

  // 1️⃣ Dominasi emosi negatif (MAX 40)
  if (signature.negativeRatio >= 0.7) {
    score += 40;
    drivers.push("Dominasi emosi negatif");
  } else if (signature.negativeRatio >= 0.5) {
    score += 25;
  } else if (signature.negativeRatio >= 0.3) {
    score += 10;
  }

  // 2️⃣ Ketidakstabilan emosi / volatility (MAX 30)
  const volatilityScore = Math.min(signature.volatility * 30, 30);
  score += volatilityScore;

  if (signature.volatility >= 0.5) {
    drivers.push("Emosi sering berubah");
  }

  // 3️⃣ Emosi dominan berisiko (MAX 30)
  if (
    signature.dominantEmotion &&
    ["STRESSED", "IMPULSIVE"].includes(signature.dominantEmotion)
  ) {
    score += 30;
    drivers.push("Emosi dominan berisiko tinggi");
  }

  // Clamp
  score = Math.min(100, Math.round(score));

  const riskLevel: "LOW" | "MEDIUM" | "HIGH" =
    score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";


  let recommendedActions: string[] = [];
  
  if (riskLevel === "HIGH") {
    recommendedActions = [
        "Tunda keputusan finansial besar selama 24 jam.",
        "Hindari transaksi impulsif hari ini.",
        "Catat emosi sebelum melakukan pembelian."
    ];
  }
  
  if (riskLevel === "MEDIUM") {
    recommendedActions = [
        "Tetapkan limit belanja harian.",
        "Evaluasi ulang kebutuhan vs keinginan."
    ];
  }
  
  if (riskLevel === "LOW") {
    recommendedActions = [
        "Kondisi emosional stabil.",
        "Aman untuk perencanaan finansial jangka panjang."
    ];
  }

  
  const summary =
    riskLevel === "HIGH"
      ? "Pola emosional menunjukkan risiko tinggi memicu keputusan finansial impulsif."
      : riskLevel === "MEDIUM"
      ? "Terdapat tekanan emosional yang berpotensi mempengaruhi keputusan finansial."
      : "Kondisi emosional relatif stabil terhadap keputusan finansial.";

  return {
    riskScore: score,
    riskLevel,
    drivers,
    summary,
    recommendedActions
  };
}