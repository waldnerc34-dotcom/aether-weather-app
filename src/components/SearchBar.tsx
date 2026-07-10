import { useEffect, useRef, useState } from "react";
import type { CityResult } from "../types/weather";
import { searchCities } from "../lib/api";
import { cn } from "../utils/cn";

interface Props {
  onSelect: (city: CityResult) => void;
  units: "F" | "C";
  onToggleUnits: () => void;
}

export function SearchBar({ onSelect, units, onToggleUnits }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const cities = await searchCities(query);
        setResults(cities);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div ref={wrapRef} className="relative z-30 flex w-full max-w-md items-center gap-2">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg className="h-4 w-4 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" strokeLinecap="round" />
          </svg>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search cities…"
          className={cn(
            "w-full rounded-2xl border border-white/15 bg-[rgba(20,28,42,0.45)] py-2.5 pl-10 pr-10",
            "text-sm text-white placeholder:text-white/40 outline-none",
            "backdrop-blur-2xl transition focus:border-white/30 focus:bg-[rgba(28,36,52,0.55)]"
          )}
        />
        {loading && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
          </div>
        )}
        {open && results.length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 shadow-2xl backdrop-blur-2xl">
            {results.map((c) => (
              <button
                key={`${c.id}-${c.latitude}`}
                type="button"
                onClick={() => {
                  onSelect(c);
                  setQuery("");
                  setOpen(false);
                  setResults([]);
                }}
                className="flex w-full items-start gap-2 border-b border-white/5 px-4 py-3 text-left transition last:border-0 hover:bg-white/10"
              >
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-sky-300/80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-white">{c.name}</div>
                  <div className="text-xs text-white/50">
                    {[c.admin1, c.country].filter(Boolean).join(", ")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onToggleUnits}
        className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-xl transition hover:bg-white/15"
        aria-label="Toggle temperature units"
      >
        °{units}
      </button>
    </div>
  );
}
