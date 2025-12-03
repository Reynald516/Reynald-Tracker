"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Transaction } from "@/hooks/use-transaction";
import { formatRupiah } from "@/lib/utils";

interface Props {
  transactions: Transaction[];
}

export default function BarBulanan({ transactions }: Props) {
  // Map bulan → total pengeluaran
  const dataMap: Record<string, number> = {};

  const bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];

  // Inisialisasi 12 bulan
  bulan.forEach((b) => (dataMap[b] = 0));

  transactions.forEach((t) => {
    const d = new Date(t.date);
    const monthIndex = d.getMonth();
    const monthName = bulan[monthIndex];

    dataMap[monthName] += t.amount;
  });

  const data = Object.entries(dataMap).map(([bulan, amount]) => ({
    bulan,
    amount,
  }));

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="bulan" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip formatter={(v) => formatRupiah(Number(v))} />
          <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
