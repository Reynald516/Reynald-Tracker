import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useLastSpendingMinutesAgo(userId?: string | null) {
  const [minutesAgo, setMinutesAgo] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) {
      setMinutesAgo(null);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("date, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data?.created_at) {
        setMinutesAgo(null);
        return;
      }

      const last = new Date(data.created_at).getTime();
      const now = Date.now();
      setMinutesAgo(Math.floor((now - last) / 60000));
    })();
  }, [userId]);

  return { minutesAgo };
}