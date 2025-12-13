// src/hooks/use-profile.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ======================
  // FETCH USER PROFILE
  // ======================
  const loadProfile = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!error && data) setProfile(data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ======================
  // UPDATE PROFILE
  // ======================
  const updateProfile = async (fields: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .update(fields)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (!error) setProfile(data);

    return { data, error };
  };

  return {
    profile,
    loading,
    updateProfile,
    reload: loadProfile,
  };
}