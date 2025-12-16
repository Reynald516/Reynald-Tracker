import { supabase } from "@/lib/supabase";
import { InterventionLevel } from "@/lib/spending-intervention-engine";
import { rebuildUserInterventionProfile } from "@/lib/intervention-personalization-engine";

export async function extractLearningSignal(feedback: {
  userId: string;
  interventionLogId: string;
  interventionLevel: InterventionLevel;
  riskScore: number;
  spentAfter: boolean;
  minutesUntilNextSpending: number | null;
  cooldownMinutes: number;
  riskDrivers: string[];
}) {
  const compliance =
    !feedback.spentAfter
      ? 1
      : feedback.minutesUntilNextSpending &&
        feedback.minutesUntilNextSpending >= feedback.cooldownMinutes
      ? 0.5
      : 0;

  const violationType =
    !feedback.spentAfter
      ? "NONE"
      : feedback.minutesUntilNextSpending &&
        feedback.minutesUntilNextSpending <= 5
      ? "IMMEDIATE"
      : "DELAYED";

  const effectiveness =
    compliance *
    (feedback.cooldownMinutes /
      (feedback.minutesUntilNextSpending || feedback.cooldownMinutes));

  await supabase.from("intervention_learning_signals").insert({
    user_id: feedback.userId,
    intervention_log_id: feedback.interventionLogId,
    intervention_level: feedback.interventionLevel,
    risk_score: feedback.riskScore,
    compliance_score: compliance,
    violation_type: violationType,
    minutes_until_next_spending: feedback.minutesUntilNextSpending,
    effectiveness_score: effectiveness,
    risk_drivers: feedback.riskDrivers,
  });
  // setelah insert intervention_learning_signals
  await rebuildUserInterventionProfile(feedback.userId);
}