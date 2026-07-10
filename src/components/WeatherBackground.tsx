import { useMemo } from "react";
import type { ConditionKey } from "../types/weather";
import { getBackgroundImage } from "../lib/weatherCodes";
import { cn } from "../utils/cn";

interface Props {
  condition: ConditionKey;
}

function RainDrops() {
  const drops = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${(i * 7.3) % 100}%`,
        delay: `${(i % 12) * 0.18}s`,
        duration: `${0.55 + (i % 5) * 0.12}s`,
        opacity: 0.25 + (i % 4) * 0.12,
        height: 12 + (i % 6) * 4,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {drops.map((d) => (
        <span
          key={d.id}
          className="absolute top-[-40px] w-[1.5px] animate-rain rounded-full bg-gradient-to-b from-white/0 via-white/70 to-white/10"
          style={{
            left: d.left,
            height: d.height,
            opacity: d.opacity,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
      {/* glass droplets */}
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={`blob-${i}`}
          className="absolute rounded-full bg-white/10 shadow-[inset_0_0_8px_rgba(255,255,255,0.25)] backdrop-blur-[1px]"
          style={{
            width: 6 + (i % 5) * 4,
            height: 8 + (i % 4) * 5,
            left: `${(i * 13.7) % 96}%`,
            top: `${(i * 17.3) % 88}%`,
            opacity: 0.35 + (i % 3) * 0.1,
            transform: `rotate(${(i * 23) % 40 - 20}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function SnowFlakes() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: `${(i * 11) % 100}%`,
        delay: `${(i % 10) * 0.35}s`,
        duration: `${3.5 + (i % 6) * 0.6}s`,
        size: 3 + (i % 4),
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {flakes.map((f) => (
        <span
          key={f.id}
          className="absolute top-[-20px] animate-snow rounded-full bg-white/80"
          style={{
            left: f.left,
            width: f.size,
            height: f.size,
            animationDelay: f.delay,
            animationDuration: f.duration,
          }}
        />
      ))}
    </div>
  );
}

function Lightning() {
  return (
    <div className="pointer-events-none absolute inset-0 animate-lightning bg-white/0" />
  );
}

export function WeatherBackground({ condition }: Props) {
  const src = getBackgroundImage(condition);
  const showRain = condition === "rain" || condition === "drizzle" || condition === "storm";
  const showSnow = condition === "snow" || condition === "sleet";
  const showStorm = condition === "storm";

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center transition-[background-image] duration-1000"
        style={{ backgroundImage: `url(${src})` }}
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55",
          condition === "clear" && "from-sky-900/30 via-black/25 to-black/45",
          condition === "night" && "from-indigo-950/50 via-black/40 to-black/60"
        )}
      />
      {showRain && <RainDrops />}
      {showSnow && <SnowFlakes />}
      {showStorm && <Lightning />}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]" />
    </div>
  );
}
