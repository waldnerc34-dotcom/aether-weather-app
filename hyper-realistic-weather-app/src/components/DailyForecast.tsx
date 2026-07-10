import type { DailyPoint } from "../types/weather";
import { formatDay } from "../lib/weatherCodes";
import { WeatherIcon } from "./WeatherIcon";
import { GlassCard } from "./GlassCard";

interface Props {
  daily: DailyPoint[];
  timezone: string;
}

function TempBar({ min, max, globalMin, globalMax }: { min: number; max: number; globalMin: number; globalMax: number }) {
  const span = Math.max(globalMax - globalMin, 1);
  const left = ((min - globalMin) / span) * 100;
  const width = Math.max(((max - min) / span) * 100, 8);

  return (
    <div className="relative mx-2 h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
      <div
        className="absolute inset-y-0 rounded-full bg-gradient-to-r from-cyan-400 via-yellow-300 via-50% to-orange-500"
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  );
}

export function DailyForecast({ daily, timezone }: Props) {
  const temps = daily.flatMap((d) => [d.tempMin, d.tempMax]);
  const globalMin = Math.min(...temps);
  const globalMax = Math.max(...temps);

  return (
    <GlassCard className="h-full">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        10-Day Forecast
      </div>
      <div className="space-y-0.5">
        {daily.map((d, i) => (
          <div
            key={d.date}
            className="grid grid-cols-[52px_28px_36px_1fr_36px] items-center gap-1 rounded-xl px-1 py-2 transition hover:bg-white/[0.06] sm:grid-cols-[60px_32px_40px_1fr_40px]"
          >
            <span className="text-sm font-medium text-white/90">{formatDay(d.date, timezone, i)}</span>
            <WeatherIcon code={d.weatherCode} isDay size="sm" />
            <span className="text-right text-sm text-white/55">{d.tempMin}°</span>
            <TempBar min={d.tempMin} max={d.tempMax} globalMin={globalMin} globalMax={globalMax} />
            <span className="text-sm font-medium text-white">{d.tempMax}°</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
