import { supabase } from "@/lib/supabase";

type LearningSignalRow = {
  intervention_level: "BLOCK" | "WARN" | "NUDGE";
  effectiveness_score: number;
};

export async function rebuildUserInterventionProfile(userId: string) {
  const { data } = await supabase
    .from("intervention_learning_signals")
    .select("intervention_level, effectiveness_score")
    .eq("user_id", userId)
    .limit(100);

  const rows = data as LearningSignalRow[] | null;

  // 🔒 HARD GUARD
  if (!rows || rows.length < 5) return;

  const byLevel: Record<"BLOCK" | "WARN" | "NUDGE", number[]> = {
    BLOCK: [],
    WARN: [],
    NUDGE: [],
  };

  rows.forEach(d => {
    byLevel[d.intervention_level].push(d.effectiveness_score);
  });

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  const avgBlock = avg(byLevel.BLOCK);
  const avgWarn  = avg(byLevel.WARN);
  const avgNudge = avg(byLevel.NUDGE);

  let preferred: "BLOCK" | "WARN" | "NUDGE" = "NUDGE";
  let max = avgNudge ?? 0;

  if ((avgWarn ?? 0) > max) {
    preferred = "WARN";
    max = avgWarn!;
  }

  if ((avgBlock ?? 0) > max) {
    preferred = "BLOCK";
  }

  await supabase
    .from("user_intervention_profiles")
    .upsert({
      user_id: userId,
      avg_effectiveness_block: avgBlock,
      avg_effectiveness_warn: avgWarn,
      avg_effectiveness_nudge: avgNudge,
      preferred_intervention_level: preferred,
      last_updated_at: new Date().toISOString(),
    });
}