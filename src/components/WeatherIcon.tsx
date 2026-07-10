import type { ReactElement } from "react";
import type { ConditionKey } from "../types/weather";
import { getConditionKey } from "../lib/weatherCodes";
import { cn } from "../utils/cn";

interface Props {
  code: number;
  isDay?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

function Sun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="4" fill="#FDB813" />
      <g stroke="#FDB813" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
      </g>
    </svg>
  );
}

function Moon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M18.5 14.2A7.2 7.2 0 0 1 9.8 5.5 6.5 6.5 0 1 0 18.5 14.2Z"
        fill="#E8EEF8"
        stroke="#C5D0E0"
        strokeWidth="0.5"
      />
      <circle cx="14.5" cy="9" r="0.7" fill="#C5D0E0" opacity="0.6" />
      <circle cx="16.2" cy="11.5" r="0.5" fill="#C5D0E0" opacity="0.5" />
    </svg>
  );
}

function Cloud({ className, fill = "#E8EEF8" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7.5 18h9.2a4.3 4.3 0 0 0 .4-8.6 5.5 5.5 0 0 0-10.6 1.6A3.6 3.6 0 0 0 7.5 18Z"
        fill={fill}
        opacity="0.95"
      />
    </svg>
  );
}

function Partly({ className, isDay }: { className?: string; isDay: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {isDay ? (
        <>
          <circle cx="9" cy="9" r="3.2" fill="#FDB813" />
          <g stroke="#FDB813" strokeWidth="1.3" strokeLinecap="round">
            <path d="M9 3.2v1.5M9 13.3v1.5M3.2 9h1.5M13.3 9h1.5M4.9 4.9l1.1 1.1M12 12l1.1 1.1M4.9 13.1l1.1-1.1M12 6l1.1-1.1" />
          </g>
        </>
      ) : (
        <path
          d="M12 8.5A4.2 4.2 0 0 1 7.8 4.2 3.8 3.8 0 1 0 12 8.5Z"
          fill="#E8EEF8"
        />
      )}
      <path
        d="M8 19h8.5a3.8 3.8 0 0 0 .3-7.6 4.8 4.8 0 0 0-9.2 1.4A3.2 3.2 0 0 0 8 19Z"
        fill="#E8EEF8"
      />
    </svg>
  );
}

function Rain({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 13.5h9a3.8 3.8 0 0 0 .3-7.6A5 5 0 0 0 6.6 7.5 3.2 3.2 0 0 0 7 13.5Z"
        fill="#E8EEF8"
      />
      <g stroke="#6EC6FF" strokeWidth="1.5" strokeLinecap="round">
        <path d="M8.5 15.5v2.5M12 15.2v3M15.5 15.5v2.5" />
      </g>
    </svg>
  );
}

function Drizzle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 13.5h9a3.8 3.8 0 0 0 .3-7.6A5 5 0 0 0 6.6 7.5 3.2 3.2 0 0 0 7 13.5Z"
        fill="#E8EEF8"
      />
      <g fill="#8FD3FF">
        <circle cx="9" cy="16.2" r="0.8" />
        <circle cx="12" cy="17" r="0.8" />
        <circle cx="15" cy="16.2" r="0.8" />
      </g>
    </svg>
  );
}

function Snow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 13h9a3.8 3.8 0 0 0 .3-7.6A5 5 0 0 0 6.6 7 3.2 3.2 0 0 0 7 13Z"
        fill="#E8EEF8"
      />
      <g stroke="#CDE9FF" strokeWidth="1.3" strokeLinecap="round">
        <path d="M9 15.5v3M9 17h2M7 17h2M12 15.2v3.2M12 16.8h2M10 16.8h2M15 15.5v3M15 17h2M13 17h2" />
      </g>
    </svg>
  );
}

function Storm({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 12.5h9a3.8 3.8 0 0 0 .3-7.6A5 5 0 0 0 6.6 6.5 3.2 3.2 0 0 0 7 12.5Z"
        fill="#B0B8C8"
      />
      <path d="M12.2 12.5 10 16.5h2.2L11 21l4.2-5.5H13L14.2 12.5h-2Z" fill="#FDB813" />
    </svg>
  );
}

function Fog({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <g stroke="#D0D8E4" strokeWidth="1.8" strokeLinecap="round">
        <path d="M4 9h16M5 12.5h14M6 16h12" />
      </g>
    </svg>
  );
}

const iconFor: Record<
  ConditionKey,
  (p: { className?: string; isDay: boolean }) => ReactElement
> = {
  clear: ({ className, isDay }) => (isDay ? <Sun className={className} /> : <Moon className={className} />),
  night: ({ className }) => <Moon className={className} />,
  partly: ({ className, isDay }) => <Partly className={className} isDay={isDay} />,
  cloudy: ({ className }) => <Cloud className={className} fill="#D8DEE8" />,
  fog: ({ className }) => <Fog className={className} />,
  drizzle: ({ className }) => <Drizzle className={className} />,
  rain: ({ className }) => <Rain className={className} />,
  snow: ({ className }) => <Snow className={className} />,
  sleet: ({ className }) => <Snow className={className} />,
  storm: ({ className }) => <Storm className={className} />,
};

export function WeatherIcon({ code, isDay = true, size = "md", className }: Props) {
  const key = getConditionKey(code, isDay);
  const Icon = iconFor[key];
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", sizeMap[size], className)}>
      {Icon({ className: "h-full w-full", isDay })}
    </span>
  );
}
