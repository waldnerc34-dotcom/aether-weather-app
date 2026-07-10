import type { AirQuality, CurrentWeather, DailyPoint, HourlyPoint } from "../types/weather";
import { formatTime, getUvAdvice, getUvLabel, windDirection } from "../lib/weatherCodes";
import { GlassCard } from "./GlassCard";

interface Props {
  current: CurrentWeather;
  air: AirQuality;
  daily: DailyPoint[];
  hourly: HourlyPoint[];
  timezone: string;
  units: "F" | "C";
}

function AqiGauge({ aqi }: { aqi: number }) {
  const pct = Math.min(aqi / 300, 1) * 100;
  return (
    <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full">
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-yellow-300 via-orange-400 via-red-500 to-purple-600" />
      <div
        className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow"
        style={{ left: `calc(${pct}% - 7px)` }}
      />
    </div>
  );
}

function UvGauge({ uv }: { uv: number }) {
  const pct = Math.min(uv / 11, 1) * 100;
  return (
    <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full">
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-yellow-300 via-orange-400 via-red-500 to-purple-500" />
      <div
        className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow"
        style={{ left: `calc(${pct}% - 7px)` }}
      />
    </div>
  );
}

function PrecipBars({ hourly }: { hourly: HourlyPoint[] }) {
  const slice = hourly.slice(0, 24);
  const max = Math.max(...slice.map((h) => h.precipProb), 1);
  return (
    <div className="mt-3 flex h-12 items-end gap-[2px]">
      {slice.map((h, i) => (
        <div
          key={h.time}
          className="flex-1 rounded-t-sm bg-sky-400/80"
          style={{
            height: `${Math.max((h.precipProb / max) * 100, 4)}%`,
            opacity: 0.35 + (h.precipProb / 100) * 0.65,
          }}
          title={`${i}h: ${h.precipProb}%`}
        />
      ))}
    </div>
  );
}

function SunArc({ sunrise, sunset, now, timezone }: { sunrise: string; sunset: string; now: string; timezone: string }) {
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  const n = new Date(now).getTime();
  const progress = Math.min(Math.max((n - rise) / (set - rise), 0), 1);

  // Map progress 0..1 to arc angle from left (PI) to right (0)
  const angle = Math.PI - progress * Math.PI;
  const cx = 80 + Math.cos(angle) * 70;
  const cy = 78 - Math.sin(angle) * 52;

  return (
    <div className="mt-1">
      <svg viewBox="0 0 160 90" className="mx-auto h-20 w-full max-w-[220px]">
        <path
          d="M10 78 A70 52 0 0 1 150 78"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
        <path
          d="M10 78 A70 52 0 0 1 150 78"
          fill="none"
          stroke="rgba(253,184,19,0.45)"
          strokeWidth="1.5"
          strokeDasharray={`${progress * 190} 190`}
        />
        <circle cx="10" cy="78" r="3" fill="rgba(255,255,255,0.4)" />
        <circle cx="150" cy="78" r="3" fill="rgba(255,255,255,0.4)" />
        <circle cx={cx} cy={cy} r="7" fill="#FDB813" className="drop-shadow-[0_0_8px_rgba(253,184,19,0.8)]" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-white/45">
        <span>Sunrise {formatTime(sunrise, timezone)}</span>
        <span>Sunset {formatTime(sunset, timezone)}</span>
      </div>
    </div>
  );
}

export function MetricCards({ current, air, daily, hourly, timezone, units }: Props) {
  const today = daily[0];
  const precipChance = Math.max(...hourly.slice(0, 24).map((h) => h.precipProb), 0);
  const speedUnit = units === "F" ? "mph" : "km/h";
  const pressUnit = units === "F" ? "inHg" : "hPa";
  const visUnit = units === "F" ? "mi" : "km";
  const precipUnit = units === "F" ? "in" : "mm";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <GlassCard title="Air Quality">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-light tracking-tight text-white">{air.aqi}</span>
        </div>
        <div className="mt-0.5 text-sm font-medium text-emerald-300">{air.category}</div>
        <AqiGauge aqi={air.aqi} />
        <div className="mt-2 flex justify-between text-[9px] uppercase tracking-wider text-white/35">
          <span>Good</span>
          <span>Unhealthy</span>
          <span>Hazard</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-white/55">{air.description}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-[11px]">
          <div>
            <div className="text-white/40">PM2.5</div>
            <div className="font-medium text-white">{air.pm25}</div>
          </div>
          <div>
            <div className="text-white/40">PM10</div>
            <div className="font-medium text-white">{air.pm10}</div>
          </div>
          <div>
            <div className="text-white/40">O₃</div>
            <div className="font-medium text-white">{air.ozone}</div>
          </div>
          <div>
            <div className="text-white/40">NO₂</div>
            <div className="font-medium text-white">{air.no2}</div>
          </div>
          <div>
            <div className="text-white/40">SO₂</div>
            <div className="font-medium text-white">{air.so2}</div>
          </div>
          <div>
            <div className="text-white/40">CO</div>
            <div className="font-medium text-white">{air.co}</div>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Precipitation">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-light tracking-tight text-white">{precipChance}%</span>
          <span className="text-sm text-white/50">chance</span>
        </div>
        <div className="mt-0.5 text-xs text-white/50">in the next 24 hours</div>
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
            style={{ width: `${precipChance}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[9px] uppercase tracking-wider text-white/35">
          <span>None</span>
          <span>Likely</span>
          <span>Certain</span>
        </div>
        <PrecipBars hourly={hourly} />
        <p className="mt-3 text-xs text-white/55">
          {precipChance >= 50
            ? "Next few hours · then clearing"
            : precipChance >= 20
              ? "Scattered chances throughout the day"
              : "Dry conditions expected"}
        </p>
        <div className="mt-2 text-[11px] text-white/40">
          Accum: {today?.precipSum ?? 0} {precipUnit}
        </div>
      </GlassCard>

      <GlassCard title="UV Index">
        <div className="text-4xl font-light tracking-tight text-white">{Math.round(current.uvIndex)}</div>
        <div className="mt-0.5 text-sm font-medium text-white/80">{getUvLabel(current.uvIndex)}</div>
        <UvGauge uv={current.uvIndex} />
        <div className="mt-2 flex justify-between text-[9px] uppercase tracking-wider text-white/35">
          <span>Low</span>
          <span>Mod</span>
          <span>High</span>
          <span>Ext</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-white/55">{getUvAdvice(current.uvIndex)}</p>
        <div className="mt-2 text-[11px] text-white/40">
          Peak today: {today?.uvIndexMax ?? "—"}
        </div>
      </GlassCard>

      <GlassCard title="Sunset">
        <div className="text-3xl font-light tracking-tight text-white">
          {today ? formatTime(today.sunset, timezone) : "—"}
        </div>
        <div className="mt-0.5 text-xs text-white/50">Tonight</div>
        {today && (
          <SunArc
            sunrise={today.sunrise}
            sunset={today.sunset}
            now={current.time}
            timezone={timezone}
          />
        )}
      </GlassCard>

      <GlassCard title="Wind">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-light tracking-tight text-white">{current.windSpeed}</span>
          <span className="mb-1 text-sm text-white/50">{speedUnit}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm text-white/70">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs"
            style={{ transform: `rotate(${current.windDir}deg)` }}
          >
            ↑
          </span>
          {windDirection(current.windDir)} · Gusts {current.windGusts} {speedUnit}
        </div>
      </GlassCard>

      <GlassCard title="Feels Like">
        <div className="text-4xl font-light tracking-tight text-white">{current.feelsLike}°</div>
        <p className="mt-2 text-xs text-white/55">
          {current.feelsLike < current.temp
            ? "Wind is making it feel cooler than the actual temperature."
            : current.feelsLike > current.temp
              ? "Humidity is making it feel warmer than the actual temperature."
              : "Similar to the actual temperature."}
        </p>
      </GlassCard>

      <GlassCard title="Humidity">
        <div className="flex items-end gap-1">
          <span className="text-4xl font-light tracking-tight text-white">{current.humidity}</span>
          <span className="mb-1 text-lg text-white/50">%</span>
        </div>
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-400 to-sky-400"
            style={{ width: `${current.humidity}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-white/55">
          {current.humidity > 70
            ? "The air is quite humid."
            : current.humidity < 30
              ? "The air is dry."
              : "Comfortable humidity levels."}
        </p>
      </GlassCard>

      <GlassCard title="Visibility">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-light tracking-tight text-white">{current.visibility}</span>
          <span className="mb-1 text-sm text-white/50">{visUnit}</span>
        </div>
        <p className="mt-2 text-xs text-white/55">
          {current.visibility > (units === "F" ? 8 : 13)
            ? "Perfectly clear view."
            : current.visibility > (units === "F" ? 3 : 5)
              ? "Moderate visibility."
              : "Reduced visibility — drive carefully."}
        </p>
      </GlassCard>

      <GlassCard title="Pressure">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-light tracking-tight text-white">{current.pressure}</span>
          <span className="mb-1 text-sm text-white/50">{pressUnit}</span>
        </div>
        <p className="mt-2 text-xs text-white/55">Mean sea level pressure.</p>
      </GlassCard>

      <GlassCard title="Cloud Cover">
        <div className="flex items-end gap-1">
          <span className="text-4xl font-light tracking-tight text-white">{current.cloudCover}</span>
          <span className="mb-1 text-lg text-white/50">%</span>
        </div>
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-slate-300 to-slate-100"
            style={{ width: `${current.cloudCover}%` }}
          />
        </div>
      </GlassCard>
    </div>
  );
}
