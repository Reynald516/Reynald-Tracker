"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import type { Transaction } from "@/hooks/use-transaction";
import { formatRupiah } from "@/lib/utils";

interface Props {
  transactions: Transaction[];
}

export default function LineHarian({ transactions }: Props) {
  // ambil 7 hari terakhir
  const today = new Date();
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return d;
  });

  const data = last7.map((d) => {
    const tanggalString = d.toISOString().split("T")[0];

    const totalHariIni = transactions
      .filter((t) => t.date.startsWith(tanggalString))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      tanggal: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      jumlah: totalHariIni,
    };
  });

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="tanggal" />
          <YAxis />
          <Tooltip formatter={(value) => formatRupiah(Number(value))} />
          <Line type="monotone" dataKey="jumlah" stroke="#4A90E2" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
