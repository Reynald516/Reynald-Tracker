import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Transaction = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  emotion?: string;
  sentiment?: number;
  user_id?: string;
};

const LS_KEY = "transactions_cache_v3";

export function useTransaction() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // 1) LOAD INITIAL DATA
  // =====================================================
  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;

        setTransactions(data || []);
        localStorage.setItem(LS_KEY, JSON.stringify(data || []));
      } catch {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) setTransactions(JSON.parse(saved));
      }

      setLoading(false);
    }

    loadData();
  }, []);

  // =====================================================
  // 2) REALTIME LISTENER (INSERT / DELETE)
  // =====================================================
  useEffect(() => {
    const channel = supabase
      .channel("transactions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTransactions((prev) => {
              const exists = prev.some((t) => t.id === payload.new.id);
              if (exists) return prev;
              return [payload.new as Transaction, ...prev];
            });
          }

          if (payload.eventType === "DELETE") {
            setTransactions((prev) =>
              prev.filter((t) => t.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // =====================================================
  // 3) ADD TRANSACTION
  // =====================================================
  async function addTransaction(t: Omit<Transaction, "id">) {
    const tempId = crypto.randomUUID();
    const newItem: Transaction = { id: tempId, ...t };

    // Optimistic update
    setTransactions((prev) => [newItem, ...prev]);

    try {
      const { error } = await supabase.from("transactions").insert(newItem);
      if (error) throw error;
    } catch {
      console.warn("Insert gagal → disimpan lokal cache");

      localStorage.setItem(
        LS_KEY,
        JSON.stringify([newItem, ...transactions])
      );
    }
  }

  // =====================================================
  // 4) DELETE TRANSACTION
  // =====================================================
  async function removeTransaction(id: string) {
    // Optimistic
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    } catch {
      console.warn("Delete gagal → update lokal saja");

      const newData = transactions.filter((t) => t.id !== id);
      localStorage.setItem(LS_KEY, JSON.stringify(newData));
    }
  }

  return { transactions, loading, addTransaction, removeTransaction };
}