// src/hooks/use-ai-category.ts

export function guessCategory(desc: string): string {
  const d = desc.toLowerCase();

  if (/(makan|food|kuliner|ayam|nasi|kopi|minum|warung|sate|bakso|martabak)/.test(d))
    return "Makan";

  if (/(gojek|grab|transport|ojek|bus|angkot|kereta|bensin|parkir)/.test(d))
    return "Transport";

  if (/(beli|belanja|shopee|tokopedia|mall|fashion|pakaian)/.test(d))
    return "Belanja";

  if (/(listrik|token|wifi|pulsa|top up|langganan)/.test(d))
    return "Lainnya";

  return "Lainnya";
}

// Extract jumlah dari teks "makan sate 15000"
export function extractAmount(text: string): number | null {
  const match = text.match(/(\d[\d\.]*)/);
  return match ? Number(match[1].replace(/\./g, "")) : null;
}
