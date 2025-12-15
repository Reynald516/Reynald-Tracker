export type EmotionType =
  | "HAPPY"
  | "CALM"
  | "STRESSED"
  | "SAD"
  | "IMPULSIVE"
  | "BORED"
  | string;

export type DailyEmotionRow = {
  emotion_type: EmotionType;
  intensity: number;
  date: string; // YYYY-MM-DD
};

export type EmotionalSignature = {
  daysCount: number;
  dominantEmotion: EmotionType | null;
  distribution: Record<string, number>;
  positiveRatio: number; // 0..1
  negativeRatio: number; // 0..1
  volatility: number; // ⬅ TAMBAH INI
};

const POSITIVE = new Set(["HAPPY", "CALM"]);
const NEGATIVE = new Set(["STRESSED", "SAD", "IMPULSIVE", "BORED"]);

export function buildEmotionalSignature(rows: DailyEmotionRow[]): EmotionalSignature {
  const distribution: Record<string, number> = {};
  let pos = 0;
  let neg = 0;

  for (const r of rows) {
    distribution[r.emotion_type] = (distribution[r.emotion_type] ?? 0) + 1;
    if (POSITIVE.has(r.emotion_type)) pos += 1;
    if (NEGATIVE.has(r.emotion_type)) neg += 1;
  }

  // volatility = jumlah perubahan emosi / hari
  const changes = rows.reduce((acc, r, i) => {
    if (i === 0) return acc;
    return rows[i - 1].emotion_type !== r.emotion_type ? acc + 1 : acc;
  }, 0);
  
  const volatility = rows.length > 1
    ? +(changes / (rows.length - 1)).toFixed(2)
    : 0;

  const daysCount = rows.length;

  let dominantEmotion: EmotionType | null = null;
  let best = -1;
  for (const [k, v] of Object.entries(distribution)) {
    if (v > best) {
      best = v;
      dominantEmotion = k;
    }
  }

  const positiveRatio = daysCount ? pos / daysCount : 0;
  const negativeRatio = daysCount ? neg / daysCount : 0;

  return {
    daysCount,
    dominantEmotion,
    distribution,
    positiveRatio,
    negativeRatio,
    volatility, // ⬅ WAJIB
  };
}