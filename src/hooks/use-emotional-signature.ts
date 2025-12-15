// src/hooks/use-emotional-signature.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  buildEmotionalSignature,
  type EmotionalSignature,
  type DailyEmotionRow,
} from "@/lib/emotional-signature-engine";

export function useEmotionalSignature(userId: string | null, days = 14) {
  const [signature, setSignature] = useState<EmotionalSignature | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const run = async () => {
      setLoading(true);

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      const from = fromDate.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("daily_emotions")
        .select("emotion_type, intensity, date")
        .eq("user_id", userId)
        .gte("date", from);

      if (error || !data || data.length === 0) {
        setSignature(null);
        setLoading(false);
        return;
      }

      const sig = buildEmotionalSignature(data as DailyEmotionRow[]);
      setSignature(sig);
      setLoading(false);
    };

    run();
  }, [userId, days]);

  return { signature, loading };
}