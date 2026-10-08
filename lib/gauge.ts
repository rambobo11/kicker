export type GaugeTone = "fresh" | "soon" | "overdue";

export type RoutineGauge = {
  tone: GaugeTone;
  value: number;
  elapsedLabel: string;
  statusLabel: string;
};

const DAY_MS = 86_400_000;

function elapsedLabel(elapsedDays: number) {
  const days = Math.floor(elapsedDays);
  if (days <= 0) return "Faite aujourd'hui";
  if (days === 1) return "Faite hier";
  return `Faite il y a ${days} jours`;
}

export function routineGauge(
  lastCompletedAt: Date | null,
  intervalDays: number,
  now = Date.now(),
): RoutineGauge {
  if (!lastCompletedAt) {
    return {
      tone: "overdue",
      value: 100,
      elapsedLabel: "Jamais faite",
      statusLabel: "À faire",
    };
  }

  const elapsedDays = (now - lastCompletedAt.getTime()) / DAY_MS;
  const urgency = elapsedDays / intervalDays;

  if (urgency >= 1) {
    return {
      tone: "overdue",
      value: 100,
      elapsedLabel: elapsedLabel(elapsedDays),
      statusLabel: "En retard",
    };
  }

  if (urgency >= 0.7) {
    return {
      tone: "soon",
      value: Math.max(8, Math.round((1 - urgency) * 100)),
      elapsedLabel: elapsedLabel(elapsedDays),
      statusLabel: "Bientôt",
    };
  }

  return {
    tone: "fresh",
    value: Math.max(8, Math.round((1 - urgency) * 100)),
    elapsedLabel: elapsedLabel(elapsedDays),
    statusLabel: "Large",
  };
}

export function urgencyScore(lastCompletedAt: Date | null, intervalDays: number, now = Date.now()) {
  if (!lastCompletedAt) return Number.POSITIVE_INFINITY;
  return (now - lastCompletedAt.getTime()) / DAY_MS / intervalDays;
}

export const gaugeClass: Record<GaugeTone, string> = {
  fresh: "bg-[#3c9a62]",
  soon: "bg-[#e0943a]",
  overdue: "bg-[#d4514a]",
};

export const gaugeTextClass: Record<GaugeTone, string> = {
  fresh: "text-[#2f7d4e] dark:text-[#8dcea8]",
  soon: "text-[#b57422] dark:text-[#f0c27a]",
  overdue: "text-[#c44740] dark:text-[#f0a8a4]",
};
