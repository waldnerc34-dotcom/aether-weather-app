import { useCallback, useEffect, useMemo, useState } from "react";
import type { CityResult, WeatherBundle } from "./types/weather";
import { DEFAULT_CITY, fetchWeather } from "./lib/api";
import { getConditionKey, getWeatherLabel } from "./lib/weatherCodes";
import { WeatherBackground } from "./components/WeatherBackground";
import { SearchBar } from "./components/SearchBar";
import { HourlyForecast } from "./components/HourlyForecast";
import { DailyForecast } from "./components/DailyForecast";
import { MetricCards } from "./components/MetricCards";
import { WeatherIcon } from "./components/WeatherIcon";

export default function App() {
  const [city, setCity] = useState<CityResult>(DEFAULT_CITY);
  const [units, setUnits] = useState<"F" | "C">("F");
  const [data, setData] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (c: CityResult, u: "F" | "C", soft = false) => {
      if (soft) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const bundle = await fetchWeather(c, u);
        setData(bundle);
      } catch {
        setError("Unable to load weather. Check your connection and try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void load(city, units);
  }, [city, units, load]);

  const condition = useMemo(() => {
    if (!data) return "rain" as const;
    return getConditionKey(data.current.weatherCode, data.current.isDay);
  }, [data]);

  const handleSelect = (c: CityResult) => setCity(c);
  const toggleUnits = () => setUnits((u) => (u === "F" ? "C" : "F"));

  return (
    <div className="relative min-h-full w-full text-white">
      <WeatherBackground condition={condition} />

      <div className="relative z-10 mx-auto flex min-h-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* Top bar */}
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar onSelect={handleSelect} units={units} onToggleUnits={toggleUnits} />
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {refreshing && (
              <span className="text-xs text-white/50">Updating…</span>
            )}
            <button
              type="button"
              onClick={() => void load(city, units, true)}
              className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white/80 backdrop-blur-xl transition hover:bg-white/15"
            >
              Refresh
            </button>
          </div>
        </header>

        {loading && !data && (
          <div className="flex flex-1 flex-col gap-4 py-2">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.4fr]">
              <div className="space-y-4 px-2 py-4">
                <div className="h-8 w-40 animate-pulse rounded-lg bg-white/10" />
                <div className="h-28 w-48 animate-pulse rounded-2xl bg-white/10" />
                <div className="h-4 w-56 animate-pulse rounded bg-white/10" />
                <div className="h-12 w-72 animate-pulse rounded-lg bg-white/10" />
              </div>
              <div className="h-40 animate-pulse rounded-[22px] bg-white/10" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.35fr]">
              <div className="h-[420px] animate-pulse rounded-[22px] bg-white/10" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-40 animate-pulse rounded-[22px] bg-white/10" />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && !data && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
            <p className="max-w-md text-center text-white/80">{error}</p>
            <button
              type="button"
              onClick={() => void load(city, units)}
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium backdrop-blur-xl hover:bg-white/15"
            >
              Try again
            </button>
          </div>
        )}

        {data && (
          <div className="flex flex-1 flex-col gap-4 lg:gap-5">
            {/* Hero + hourly */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:items-start">
              <section className="animate-fade-up px-1 py-2 sm:px-2">
                <h1 className="truncate text-[28px] font-normal tracking-tight text-white drop-shadow-lg sm:text-[32px]">
                  {data.city.name}
                </h1>

                <div className="mt-1 flex items-start gap-0.5">
                  <span className="text-[100px] font-extralight leading-none tracking-tighter text-white drop-shadow-2xl sm:text-[118px]">
                    {data.current.temp}
                  </span>
                  <span className="mt-5 text-4xl font-light text-white/85 sm:text-5xl">°</span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-[15px] text-white/70">
                  <WeatherIcon
                    code={data.current.weatherCode}
                    isDay={data.current.isDay}
                    size="sm"
                  />
                  <span>{getWeatherLabel(data.current.weatherCode)}</span>
                </div>

                <div className="mt-2 text-sm text-white/55">
                  Feels Like: {data.current.feelsLike}° · H:{data.daily[0]?.tempMax ?? "—"}° L:
                  {data.daily[0]?.tempMin ?? "—"}°
                </div>

                <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/50">
                  {data.summary}
                </p>
              </section>

              <div className="animate-fade-up-delay-1">
                <HourlyForecast hourly={data.hourly} timezone={data.city.timezone} />
              </div>
            </div>

            {/* Forecast + metrics */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
              <div className="animate-fade-up-delay-2">
                <DailyForecast daily={data.daily} timezone={data.city.timezone} />
              </div>
              <div className="animate-fade-up-delay-3">
                <MetricCards
                  current={data.current}
                  air={data.airQuality}
                  daily={data.daily}
                  hourly={data.hourly}
                  timezone={data.city.timezone}
                  units={data.units}
                />
              </div>
            </div>

            <footer className="mt-2 flex flex-wrap items-center justify-between gap-2 pb-4 text-[11px] text-white/35">
              <span>
                Data by Open-Meteo · Updated{" "}
                {new Date(data.current.time).toLocaleString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              <span>
                Lat {data.city.latitude.toFixed(2)} · Lon {data.city.longitude.toFixed(2)} ·{" "}
                {data.city.timezone}
              </span>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
