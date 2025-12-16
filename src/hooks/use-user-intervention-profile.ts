import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { InterventionLevel } from "@/lib/spending-intervention-engine";

type UserInterventionProfile = {
  user_id: string;
  preferred_intervention_level?: InterventionLevel;
};

export function useUserInterventionProfile(userId: string) {
  const [profile, setProfile] = useState<UserInterventionProfile | null>(null);

  useEffect(() => {
    if (!userId) return;

    supabase
      .from("user_intervention_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [userId]);

  return { profile };
}