import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
  user_id: string;
  type: "income" | "expense";
  notes: string | null;
  emotion_id: string | null;
}

const CACHE_KEY = "transactions_cache_v3";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =======================
  // FETCH DATA
  // =======================
  const loadTransactions = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data) {
      setTransactions(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    }

    setLoading(false);
  }, []);

  // =======================
  // INITIAL LOAD + REALTIME
  // =======================
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) setTransactions(JSON.parse(cached));

    loadTransactions();

    const channel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        payload => {
          setTransactions(prev => {
            let updated = prev;

            if (payload.eventType === "INSERT") {
              updated = [...prev, payload.new as Transaction];
            } else if (payload.eventType === "UPDATE") {
              updated = prev.map(t =>
                t.id === payload.new.id ? (payload.new as Transaction) : t
              );
            } else if (payload.eventType === "DELETE") {
              updated = prev.filter(t => t.id !== payload.old.id);
            }

            localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadTransactions]);

  // =======================
  // ADD TRANSACTION (FIXED)
  // =======================
  const addTransaction = useCallback(async (tx) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("User belum login");
      return null;
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          ...tx,
          user_id: user.id,
          type: tx.type,
          emotion_id: null,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Gagal tambah transaksi:", error.message);
      return null;
    }

    return data; // ← WAJIB! Karena dipakai untuk insert ke emotions
  }, []);

  // =======================
  // DELETE TRANSACTION
  // =======================
  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) setError(error.message);
  }, []);

  return { transactions, loading, error, addTransaction, deleteTransaction };
}