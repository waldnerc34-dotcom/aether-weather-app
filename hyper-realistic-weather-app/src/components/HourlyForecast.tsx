import type { HourlyPoint } from "../types/weather";
import { formatHour } from "../lib/weatherCodes";
import { WeatherIcon } from "./WeatherIcon";
import { GlassCard } from "./GlassCard";

interface Props {
  hourly: HourlyPoint[];
  timezone: string;
}

export function HourlyForecast({ hourly, timezone }: Props) {
  const first12 = hourly.slice(0, 12);
  const next12 = hourly.slice(12, 24);

  return (
    <GlassCard className="overflow-x-auto p-3 sm:p-4">
      <div className="min-w-[640px] space-y-3">
        <div className="grid grid-cols-12 gap-1">
          {first12.map((h, i) => (
            <div key={h.time} className="flex flex-col items-center gap-1.5 py-1">
              <span className="text-[10px] font-medium text-white/55 sm:text-[11px]">
                {i === 0 ? "Now" : formatHour(h.time, timezone)}
              </span>
              <WeatherIcon code={h.weatherCode} isDay={h.isDay} size="sm" />
              <span className="text-xs font-semibold text-white sm:text-sm">{h.temp}°</span>
            </div>
          ))}
        </div>
        {next12.length > 0 && (
          <div className="grid grid-cols-12 gap-1 border-t border-white/10 pt-3">
            {next12.map((h) => (
              <div key={h.time} className="flex flex-col items-center gap-1.5 py-1">
                <span className="text-[10px] font-medium text-white/55 sm:text-[11px]">
                  {formatHour(h.time, timezone)}
                </span>
                <WeatherIcon code={h.weatherCode} isDay={h.isDay} size="sm" />
                <span className="text-xs font-semibold text-white sm:text-sm">{h.temp}°</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
