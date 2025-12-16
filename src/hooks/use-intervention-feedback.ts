import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { insertInterventionFeedback } from "@/lib/intervention-feedback-engine";

export function useInterventionFeedbackWatcher(params: {
  userId: string | null;
  interventionLogId: string | null;
  windowMinutes?: number; // default 60
}) {
  const { userId, interventionLogId, windowMinutes = 60 } = params;

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId || !interventionLogId) return;

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
      } catch {
        // sengaja silent, biar gak ganggu UX
      }
    }, windowMinutes * 60_000);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [userId, interventionLogId, windowMinutes]);
}