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
  lastSpendingMinutesAgo: number | null,
  userProfile?: {
    preferred_intervention_level?: InterventionLevel;
  }
): SpendingIntervention | null {
  if (!risk) return null;

  const mins = lastSpendingMinutesAgo ?? 999999;

  let intervention: SpendingIntervention;

  // BASE POLICY (GLOBAL SAFETY)
  if (risk.riskLevel === "HIGH") {
    intervention = {
      level: "BLOCK",
      reason: "HIGH_EMOTIONAL_RISK",
      message: "Kondisi emosionalmu sedang tidak stabil. Tunda pengeluaran besar selama 24 jam.",
      cooldownMinutes: 1440,
    };
  } else if (risk.riskLevel === "MEDIUM" && mins < 60) {
    intervention = {
      level: "WARN",
      reason: "RECENT_SPENDING_UNDER_PRESSURE",
      message: "Kamu baru saja belanja saat emosi kurang stabil. Yakin ini kebutuhan?",
      cooldownMinutes: 60,
    };
  } else if (risk.riskScore >= 30) {
    intervention = {
      level: "NUDGE",
      reason: "EMOTIONAL_DRIFT",
      message: "Cek kembali anggaranmu sebelum melanjutkan transaksi.",
      cooldownMinutes: 10,
    };
  } else {
    intervention = {
      level: "NONE",
      reason: "SAFE",
      message: "",
      cooldownMinutes: 0,
    };
  }

  // 🎯 PERSONALIZATION LAYER (NO OVERRIDE HARD BLOCK)
  if (
    userProfile?.preferred_intervention_level &&
    intervention.level !== "BLOCK"
  ) {
    intervention = {
      ...intervention,
      level: userProfile.preferred_intervention_level,
      reason: "PERSONALIZED_POLICY",
    };
  }

  return intervention;
}