export interface MonthData {
  counts: number[];
  max: number;
  today: number;
  dim: number;
  monthLabel: string;
}

/**
 * Per-day request counts for the current month — ported 1:1 from the source
 * Component.monthData(). Days before today use a deterministic sin/cos curve,
 * today reflects the live request count, future days are zero.
 */
export function monthData(requestsLength: number): MonthData {
  const now = new Date(),
    y = now.getFullYear(),
    m = now.getMonth();
  const dim = new Date(y, m + 1, 0).getDate(),
    today = now.getDate();
  const counts: number[] = [];
  for (let d = 1; d <= dim; d++) {
    if (d < today)
      counts.push(
        3 +
          Math.round(
            (Math.sin(d * 1.7) * 0.5 + 0.5) * 9 +
              (Math.cos(d * 0.9) * 0.5 + 0.5) * 3,
          ),
      );
    else if (d === today) counts.push(requestsLength);
    else counts.push(0);
  }
  const max = Math.max(8, ...counts);
  return {
    counts,
    max,
    today,
    dim,
    monthLabel: now.toLocaleString("en-US", { month: "long", year: "numeric" }),
  };
}
