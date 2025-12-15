// src/hooks/use-emotional-baseline.ts

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  calculateBaselineScore,
  generateBaselineSummary,
} from "@/lib/baseline-engine";

export function useEmotionalBaseline() {
  const [baseline, setBaseline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchBaseline() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user){
        setLoading(false);
        return;
    }
    // 1️⃣ AGGREGATE 14 HARI
    const { data, error } = await supabase.rpc("aggregate_emotional_baseline");

    if (error || !data?.length) {
      setLoading(false);
      return;
    }

    const row = data[0];

    const { data: existing } = await supabase
      .from("emotional_baselines")
      .select("baseline_score, summary")
      .eq("user_id", user.id)
      .eq("period_start", row.period_start)
      .eq("period_end", row.period_end)
      .maybeSingle();
      
    if (existing) {
        setBaseline(existing);
        setLoading(false);
        return;
    }

    // 2️⃣ HITUNG SCORE + SUMMARY
    const baselineScore = calculateBaselineScore({
      avgIntensity: row.avg_intensity,
      negativeRatio: row.negative_ratio,
      positiveRatio: row.positive_ratio,
      emotionalVolatility: row.emotional_volatility,
    });

    const summary = generateBaselineSummary({
      dominantEmotion: row.dominant_emotion,
      avgIntensity: row.avg_intensity,
      emotionalVolatility: row.emotional_volatility,
      negativeRatio: row.negative_ratio,
    });

    // 3️⃣ INSERT KE TABLE emotional_baselines
    await supabase
    .from("emotional_baselines")
    .upsert({
      user_id: user.id,
      period_start: row.period_start,
      period_end: row.period_end,
      dominant_emotion: row.dominant_emotion,
      avg_intensity: row.avg_intensity,
      emotional_volatility: row.emotional_volatility,
      negative_ratio: row.negative_ratio,
      positive_ratio: row.positive_ratio,
      baseline_score: baselineScore,
      summary,
    }, { onConflict: "user_id,period_start,period_end" });

    setBaseline({
      baseline_score: baselineScore,
      summary,
    });

    setLoading(false);
  }

  useEffect(() => {
    fetchBaseline();
  }, []);

  return { baseline, loading };
}