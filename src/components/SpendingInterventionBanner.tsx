import type { SpendingIntervention } from "@/lib/spending-intervention-engine";

export default function SpendingInterventionBanner({
  intervention,
}: {
  intervention: SpendingIntervention | null;
}) {
  if (!intervention || intervention.level === "NONE") return null;

  const color =
    intervention.level === "BLOCK"
      ? "bg-red-600"
      : intervention.level === "WARN"
      ? "bg-yellow-500"
      : "bg-blue-500";

  return (
    <div className={`${color} text-white p-4 rounded-xl mb-4`}>
      <p className="font-semibold">⚠ {intervention.message}</p>
      {intervention.cooldownMinutes > 0 && (
        <p className="text-sm opacity-90 mt-1">
          Cooldown: {intervention.cooldownMinutes} menit
        </p>
      )}
    </div>
  );
}