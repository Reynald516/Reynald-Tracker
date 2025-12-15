import { useEffect, useState } from "react";
import { buildEmotionalRisk, EmotionalRisk } from "@/lib/emotional-risk-engine";
import { useEmotionalSignature } from "./use-emotional-signature";

export function useEmotionalRisk(userId?: string) {
  const { signature, loading: sigLoading } = useEmotionalSignature(userId);

  const [risk, setRisk] = useState<EmotionalRisk | null>(null);

  useEffect(() => {
    if (!signature) return;
    setRisk(buildEmotionalRisk(signature));
  }, [signature]);

  return {
    risk,
    loading: sigLoading,
  };
}