import { supabase } from "@/lib/supabase";
import { EmotionalRisk } from "./emotional-risk-engine";

export async function logIntervention({
  userId,
  risk,
  intervention,
  minutesAgo,
}: {
  userId: string;
  risk: EmotionalRisk;
  intervention: {
    level: "BLOCK" | "WARN" | "NUDGE";
    message: string;
    cooldownMinutes?: number;
  };
  minutesAgo: number | null;
}) {
  if (!userId || !intervention) return null;

  const { data, error } = await supabase
    .from("intervention_logs")
    .insert({
      user_id: userId,
      risk_score: risk.riskScore,
      risk_level: risk.riskLevel,
      intervention_level: intervention.level,
      message: intervention.message,
      cooldown_minutes: intervention.cooldownMinutes ?? null,
      minutes_since_last_spending: minutesAgo ?? null,
    })
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}