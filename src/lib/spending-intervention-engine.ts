import { EmotionalRisk } from "./emotional-risk-engine";

export type InterventionLevel = "NONE" | "NUDGE" | "WARN" | "BLOCK";

export type SpendingIntervention = {
  level: InterventionLevel;
  reason: string;
  message: string;
  cooldownMinutes: number; // 0 kalau NONE
};

export function buildSpendingIntervention(
  risk: EmotionalRisk | null,
  lastSpendingMinutesAgo: number | null
): SpendingIntervention | null {
  if (!risk) return null;

  const mins = lastSpendingMinutesAgo ?? 999999;

  // 1) HARD BLOCK
  if (risk.riskLevel === "HIGH") {
    return {
      level: "BLOCK",
      reason: "HIGH_EMOTIONAL_RISK",
      message: "Kondisi emosionalmu sedang tidak stabil. Tunda pengeluaran besar selama 24 jam.",
      cooldownMinutes: 1440,
    };
  }

  // 2) WARN jika medium + baru belanja
  if (risk.riskLevel === "MEDIUM" && mins < 60) {
    return {
      level: "WARN",
      reason: "RECENT_SPENDING_UNDER_PRESSURE",
      message: "Kamu baru saja belanja saat emosi kurang stabil. Yakin ini kebutuhan?",
      cooldownMinutes: 60,
    };
  }

  // 3) NUDGE soft
  if (risk.riskScore >= 30) {
    return {
      level: "NUDGE",
      reason: "EMOTIONAL_DRIFT",
      message: "Cek kembali anggaranmu sebelum melanjutkan transaksi.",
      cooldownMinutes: 10,
    };
  }

  return {
    level: "NONE",
    reason: "SAFE",
    message: "",
    cooldownMinutes: 0,
  };
}