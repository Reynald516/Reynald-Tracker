// src/lib/baseline-engine.ts

export function calculateBaselineScore({
  avgIntensity,
  negativeRatio,
  positiveRatio,
  emotionalVolatility,
}: {
  avgIntensity: number;
  negativeRatio: number;
  positiveRatio: number;
  emotionalVolatility: number;
}) {
  let score = 100;
  score -= (avgIntensity / 10) * 15;
  score -= negativeRatio * 40;
  score -= Math.min(emotionalVolatility, 5) * 5;
  score += positiveRatio * 30;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function generateBaselineSummary({
  dominantEmotion,
  avgIntensity,
  emotionalVolatility,
  negativeRatio,
}: {
  dominantEmotion: string;
  avgIntensity: number;
  emotionalVolatility: number;
  negativeRatio: number;
}) {
  if (negativeRatio > 0.6) {
    return "Kamu berada dalam fase emosional negatif yang cukup dominan. Risiko keputusan impulsif tinggi.";
  }

  if (emotionalVolatility > 3) {
    return "Emosimu cenderung fluktuatif. Pola keuanganmu kemungkinan tidak konsisten.";
  }

  if (dominantEmotion === "CALM" && avgIntensity <= 4) {
    return "Kondisi emosionalmu relatif stabil. Ini fase terbaik untuk perencanaan keuangan.";
  }

  return "Pola emosionalmu cukup seimbang, namun masih ada ruang untuk peningkatan konsistensi.";
}