import { supabase } from "@/lib/supabase";

type EmotionAfter = { type: string; intensity: number } | null;

export async function insertInterventionFeedback(params: {
  interventionLogId: string;
  userId: string;
  spentAfter: boolean;
  minutesUntilNextSpending: number | null;
  emotionAfter?: EmotionAfter;
}) {
  const {
    interventionLogId,
    userId,
    spentAfter,
    minutesUntilNextSpending,
    emotionAfter,
  } = params;

  const { error } = await supabase.from("intervention_feedback").insert({
    intervention_log_id: interventionLogId,
    user_id: userId,
    spent_after: spentAfter,
    minutes_until_next_spending: minutesUntilNextSpending,
    emotion_after: emotionAfter?.type ?? null,
    emotion_intensity_after: emotionAfter?.intensity ?? null,
  });

  if (error) throw error;
}