import { useMemo } from "react";
import { buildSpendingIntervention } from "@/lib/spending-intervention-engine";
import { EmotionalRisk } from "@/lib/emotional-risk-engine";

export function useSpendingIntervention(
  risk: EmotionalRisk | null,
  lastSpendingMinutesAgo: number | null
) {
  const intervention = useMemo(() => {
    return buildSpendingIntervention(risk, lastSpendingMinutesAgo);
  }, [risk, lastSpendingMinutesAgo]);

  return { intervention };
}