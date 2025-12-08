import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export function usePsychologyEngine() {
  const { user } = useAuth();

  const [emotions, setEmotions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const { data: emoData } = await supabase
        .from("emotions")
        .select("*")
        .eq("user_id", user.id);

      const { data: trxData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id);

      setEmotions(emoData || []);
      setTransactions(trxData || []);

      setLoading(false);
    };

    load();
  }, [user]);

  // =======================
  // EMOTION MAP
  // =======================
  const emotionMap = useMemo(() => {
    const map: Record<string, number> = {};

    emotions.forEach((e) => {
      const totalSpend = transactions
        .filter((t) => t.date === e.date)
        .reduce((sum, t) => sum + t.amount, 0);

      map[e.emotion] = (map[e.emotion] || 0) + totalSpend;
    });

    return map;
  }, [emotions, transactions]);

  // =======================
  // DOMINANT EMOTION
  // =======================
  const dominantEmotion = Object.entries(emotionMap).reduce(
    (best, curr) => (curr[1] > best[1] ? curr : best),
    ["-", 0]
  )[0];

  // =======================
  // AVG INTENSITY
  // =======================
  const avgIntensity =
    emotions.length > 0
      ? Math.round(
          emotions.reduce((acc, e) => acc + e.intensity, 0) / emotions.length
        )
      : 0;

  const insight =
    emotions.length === 0
      ? null
      : {
          dominantEmotion,
          avgIntensity,
          summary: `Saat kamu merasa **${dominantEmotion}**, pengeluaranmu cenderung meningkat. Intensitas emosimu rata-rata ${avgIntensity}.`,
        };

  return { loading, insight };
}