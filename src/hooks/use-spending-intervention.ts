import { useMemo, useEffect, useRef, useState } from "react";
import { buildSpendingIntervention } from "@/lib/spending-intervention-engine";
import { EmotionalRisk } from "@/lib/emotional-risk-engine";
import { logIntervention } from "@/lib/intervention-logger";
import { useAuth } from "./use-auth";
import { useUserInterventionProfile } from "./use-user-intervention-profile";

export function useSpendingIntervention(
  risk: EmotionalRisk | null,
  lastSpendingMinutesAgo: number | null
) {
  const { user } = useAuth();
  const lastLoggedRef = useRef<string | null>(null);
  const [interventionLogId, setInterventionLogId] = useState<string | null>(null);
  const { profile } = useUserInterventionProfile(user?.id);

  const intervention = useMemo(() => {
    return buildSpendingIntervention(risk, lastSpendingMinutesAgo, profile);
  }, [risk, lastSpendingMinutesAgo, profile]);

  useEffect(() => {
    if (!user || !risk || !intervention) return;

    // 🔒 prevent duplicate logs
    const signature = `${risk.riskScore}-${intervention.level}-${lastSpendingMinutesAgo}`;
    if (lastLoggedRef.current === signature) return;
    lastLoggedRef.current = signature;

    (async () => {
      const id = await logIntervention({
        userId: user.id,
        risk,
        intervention,
        minutesAgo: lastSpendingMinutesAgo,
      });
      if (id) setInterventionLogId(id);
    })();
  }, [user?.id, risk?.riskScore, intervention?.level, lastSpendingMinutesAgo]);

  return { intervention, interventionLogId };
}