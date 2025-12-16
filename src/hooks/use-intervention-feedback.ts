import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { insertInterventionFeedback } from "@/lib/intervention-feedback-engine";
import { extractLearningSignal } from "@/lib/intervention-learning-engine";
import { SpendingIntervention } from "@/lib/spending-intervention-engine";
import { EmotionalRisk } from "@/lib/emotional-risk-engine";
import { rebuildUserInterventionProfile } from "@/lib/intervention-personalization-engine";

export function useInterventionFeedbackWatcher(params: {
  userId: string | null;
  interventionLogId: string | null;
  intervention: SpendingIntervention | null;
  risk: EmotionalRisk | null;
  windowMinutes?: number; // default 60
}) {
  const { userId, interventionLogId, intervention, risk, windowMinutes = 60 } = params;

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId || !interventionLogId) return;
    if (!intervention || !risk) return;

    // cleanup previous timer
    if (timerRef.current) window.clearTimeout(timerRef.current);

    // setelah windowMinutes, cek apakah ada transaksi setelah intervensi
    timerRef.current = window.setTimeout(async () => {
      try {
        // ambil created_at intervensi dulu
        const { data: logRow, error: logErr } = await supabase
          .from("intervention_logs")
          .select("id, user_id, created_at")
          .eq("id", interventionLogId)
          .maybeSingle();

        if (logErr || !logRow?.created_at) return;

        // cari transaksi pertama setelah created_at intervensi
        const { data: nextTrx, error: trxErr } = await supabase
          .from("transactions")
          .select("id, created_at")
          .eq("user_id", userId)
          .gt("created_at", logRow.created_at)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (trxErr) return;

        const spentAfter = !!nextTrx?.id;

        const minutesUntilNextSpending = nextTrx?.created_at
          ? Math.floor(
              (new Date(nextTrx.created_at).getTime() -
                new Date(logRow.created_at).getTime()) / 60000
            )
          : null;

        await insertInterventionFeedback({
          interventionLogId,
          userId,
          spentAfter,
          minutesUntilNextSpending,
        });
        await extractLearningSignal({
          userId,
          interventionLogId,
          interventionLevel: intervention.level,
          riskScore: risk.riskScore,
          spentAfter,
          minutesUntilNextSpending,
          cooldownMinutes: intervention.cooldownMinutes,
          riskDrivers: risk.drivers,
        });
        await rebuildUserInterventionProfile(userId);
      } catch {
        // sengaja silent, biar gak ganggu UX
      }
    }, windowMinutes * 60_000);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [userId, interventionLogId, intervention, risk, windowMinutes]);
}