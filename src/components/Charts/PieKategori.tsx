"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Transaction } from "@/hooks/use-transaction";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9C27B0"];

interface Props {
  transactions: Transaction[];
}

export default function PieKategori({ transactions }: Props) {
  const dataMap: Record<string, number> = {};

  transactions.forEach((t) => {
    if (!dataMap[t.category]) dataMap[t.category] = 0;
    dataMap[t.category] += t.amount;
  });
  const data = Object.entries(dataMap).map(([category, amount]: [string, number]) => ({
    category,
    amount,
  }));

  if (data.length === 0) {
    return <p className="opacity-60">Belum ada data untuk ditampilkan.</p>;
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
