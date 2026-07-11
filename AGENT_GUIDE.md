# ATMOS WEATHER APP - COMPLETE CODEBASE GUIDE FOR AGENTS

## REPO INFO
- Repo: waldnerc34-dotcom/Atmos
- Tech Stack: React 19 + TypeScript + Vite + Tailwind CSS
- Data Source: Open-Meteo API (free, no key needed)
- Deploy: GitHub Pages (auto-deploys via GitHub Actions on push to main)
- Live: https://waldnerc34-dotcom.github.io/Atmos/

## PROJECT STRUCTURE
```
src/
├── App.tsx              # Main app - state management, data fetching, layout
├── main.tsx             # React entry point
├── index.css            # Tailwind + custom animations (rain, snow, lightning, fade-up)
├── types/
│   └── weather.ts       # TypeScript interfaces for all data shapes
├── lib/
│   ├── api.ts           # Weather fetching + city search (Open-Meteo)
│   └── weatherCodes.ts  # Utilities: weather label/condition mappings, temp conversions
├── components/
│   ├── SearchBar.tsx    # City search + unit toggle (F/C)
│   ├── HourlyForecast.tsx # Next 24 hours in 12+12 grid
│   ├── DailyForecast.tsx  # 10-day forecast
│   ├── MetricCards.tsx    # Air quality, UV, wind, pressure, humidity
│   ├── WeatherIcon.tsx    # Weather emoji/icon based on code
│   ├── WeatherBackground.tsx # Animated background (rain/snow/lightning)
│   └── GlassCard.tsx      # Reusable glass-morphic container
└── utils/
    └── cn.ts            # Classname helper (tailwind-merge + clsx)
```

## KEY DATA TYPES (src/types/weather.ts)

```typescript
export type WeatherCode = 0 | 1 | 2 | 3 | 45 | 48 | 51 | 53 | 55 | 56 | 57 | 61 | 63 | 65 | 66 | 67 | 71 | 73 | 75 | 77 | 80 | 81 | 82 | 85 | 86 | 95 | 96 | 99;

export type ConditionKey = "clear" | "partly" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "sleet" | "storm" | "night";

export interface CityResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface HourlyPoint {
  time: string;
  temp: number;
  weatherCode: number;
  precipProb: number;
  precip: number;
  humidity: number;
  windSpeed: number;
  windGusts: number;
  windDir: number;
  uvIndex: number;
  cloudCover: number;
  pressure: number;
  visibility: number;
  feelsLike: number;
  isDay: boolean;
}

export interface DailyPoint {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipProb: number;
  precipSum: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  windSpeedMax: number;
  windGustsMax: number;
}

export interface CurrentWeather {
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  weatherCode: number;
  isDay: boolean;
  windSpeed: number;
  windGusts: number;
  windDir: number;
  pressure: number;
  cloudCover: number;
  precip: number;
  visibility: number;
  uvIndex: number;
}

export interface AirQuality {
  aqi: number;
  pm25: number;
  pm10: number;
  ozone: number;
  no2: number;
  so2: number;
  co: number;
  category: string;
  description: string;
}

export interface WeatherBundle {
  city: CityResult;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  airQuality: AirQuality;
  summary: string;
  units: "F" | "C";
}
```

## API FUNCTIONS (src/lib/api.ts)

```typescript
async function searchCities(query: string): Promise<CityResult[]>
  - Queries Open-Meteo Geocoding API
  - Returns array of city suggestions
  - Used by SearchBar for autocomplete

async function fetchWeather(city: CityResult, units: "F" | "C"): Promise<WeatherBundle>
  - Fetches from 3 Open-Meteo endpoints:
    1. /forecast (weather + hourly + daily)
    2. /air-quality (pollution data)
  - Converts temperatures and units (C↔F, km/h↔mph, mm↔in, hPa↔inHg)
  - Returns complete WeatherBundle object

const DEFAULT_CITY: CityResult = {
  id: 5380748,
  name: "Palo Alto",
  country: "United States",
  admin1: "California",
  latitude: 37.4419,
  longitude: -122.143,
  timezone: "America/Los_Angeles"
}
```

## UTILITY FUNCTIONS (src/lib/weatherCodes.ts)

```typescript
// Weather code → condition type (for background/animations)
function getConditionKey(code: number, isDay = true): ConditionKey
  - 0 (clear) → "clear" or "night"
  - 1-2 (mostly clear/partly cloudy) → "partly" or "night"
  - 3 (overcast) → "cloudy"
  - 45/48 (fog) → "fog"
  - 51/53/55 (drizzle) → "drizzle"
  - 61/63/65/80/81/82 (rain) → "rain"
  - 56/57/66/67 (freezing) → "sleet"
  - 71/73/75/77/85/86 (snow) → "snow"
  - 95/96/99 (thunder) → "storm"

// Weather code → human readable label
function getWeatherLabel(code: number): string
  Returns: "Clear sky", "Slight rain", "Heavy snow", "Thunderstorm", etc.

// Condition → background image URL
function getBackgroundImage(key: ConditionKey): string
  Returns paths like "/images/weather-sunny.jpg", "/images/weather-rain.jpg"

// Air Quality Index → category info
function getAqiInfo(aqi: number): { category: string; description: string }
  ≤50 → Good
  ≤100 → Moderate
  ≤150 → Unhealthy for Sensitive
  ≤200 → Unhealthy
  ≤300 → Very Unhealthy
  >300 → Hazardous

// UV Index → label
function getUvLabel(uv: number): string
  <3 → "Low"
  <6 → "Moderate"
  <8 → "High"
  <11 → "Very High"
  ≥11 → "Extreme"

// UV Index → safety advice
function getUvAdvice(uv: number): string

// Weather code + precipitation chance → human summary
function buildSummary(code: number, precipProbNextHours: number, dailyPrecipProbs: number[]): string
  Returns AI-like summaries: "Rain for the next few hours, then clearing..."

// Temperature conversions
function cToF(c: number): number
function kmhToMph(kmh: number): number
function mmToIn(mm: number): number
function kmToMi(km: number): number
function hPaToInHg(hpa: number): number

// Time formatting (respects timezone)
function formatHour(iso: string, timezone: string): string
  "2024-07-11T15:30:00" → "3 PM"

function formatDay(iso: string, timezone: string, index: number): string
  index 0 → "Today"
  index 1+ → "Mon", "Tue", etc.

function formatTime(iso: string, timezone: string): string
  → "3:45 PM"

// Wind direction conversion
function windDirection(deg: number): string
  0° → "N", 45° → "NE", 90° → "E", 180° → "S", 270° → "W", etc.
```

## COMPONENT BREAKDOWN

### App.tsx (Main Component)
State:
  - city: CityResult (current selected city)
  - units: "F" | "C" (temperature unit)
  - data: WeatherBundle | null (fetched weather data)
  - loading: boolean
  - error: string | null
  - refreshing: boolean

Effect Hook:
  - Calls fetchWeather() when city or units change
  - Sets loading/refreshing states
  - Catches errors

Returns:
  - WeatherBackground with animated condition
  - SearchBar (top)
  - Hero section: City name, large temperature, feels like
  - HourlyForecast: 24-hour grid
  - DailyForecast: 10-day outlook
  - MetricCards: Grid of weather metrics

### SearchBar.tsx
Props:
  - onSelect: (city: CityResult) => void
  - units: "F" | "C"
  - onToggleUnits: () => void

Features:
  - Debounced search (280ms delay)
  - Click outside to close dropdown
  - Shows city, admin1, country
  - Units toggle button (°F or °C)

### HourlyForecast.tsx
Props:
  - hourly: HourlyPoint[]
  - timezone: string

Display:
  - Splits 24 hours into two rows (12+12)
  - Shows: time (or "Now"), weather icon, temp
  - Scrollable on mobile

### DailyForecast.tsx
Props:
  - daily: DailyPoint[]
  - timezone: string

Display:
  - Grid of 10 days
  - Shows: day name, high/low temps, weather icon, precip chance

### MetricCards.tsx
Props:
  - current: CurrentWeather
  - air: AirQuality
  - daily: DailyPoint[]
  - hourly: HourlyPoint[]
  - timezone: string
  - units: "F" | "C"

Cards (10 total):
  1. Air Quality: AQI gauge (green→red gradient), PM2.5/PM10/O₃/NO₂/SO₂/CO
  2. Precipitation: % chance, bar chart of next 24 hours
  3. UV Index: Gauge (green→red), label, safety advice
  4. Sunset: Time + sun arc animation showing sunrise→sunset progress
  5. Wind: Speed, direction arrow, gusts
  6. Feels Like: Comparison explanation
  7. Humidity: Gauge + description
  8. Visibility: Distance + conditions
  9. Pressure: hPa or inHg
  10. Cloud Cover: %

### WeatherBackground.tsx
Props:
  - condition: ConditionKey

Features:
  - Full-screen background image (based on condition)
  - Animated overlay:
    * Rain: 48 falling drops with staggered timing
    * Snow: 36 falling flakes
    * Lightning: Flash animation for storms
  - Dark gradient overlay (varies by condition)
  - Radial gradient vignette

### WeatherIcon.tsx
Props:
  - code: number (WMO weather code)
  - isDay: boolean
  - size: "xs" | "sm" | "md"

Returns:
  - Emoji or SVG icon matching weather condition and day/night

### GlassCard.tsx
Props:
  - title?: string
  - className?: string
  - children: ReactNode

Features:
  - Glass-morphism container
  - Translucent background: rgba(15, 23, 42, 0.85)
  - Backdrop blur: blur(32px)
  - Border: 1px solid rgba(255,255,255,0.1)
  - Title support
  - Custom class extension

## STYLING & ANIMATIONS

### Tailwind CSS Classes Used:
- Colors: white, slate-900, sky-300, emerald-300, green-400, yellow-300, orange-400, red-500, purple-600
- Opacity variants: /10, /15, /20, /30, /40, /50, /55, /70, /80, /85, /90
- Sizes: text-xs, text-sm, text-4xl, text-[100px], h-2, w-full, etc.
- Layouts: grid, flex, gap-*, p-*, m-*
- Effects: backdrop-blur-2xl, shadow-2xl, drop-shadow-lg, rounded-2xl, border-white/*

### Custom Animations (src/index.css):

```css
@keyframes rain-fall
  0%: translateY(-40px) translateX(0), opacity 0
  10%: opacity 1
  100%: translateY(110vh) translateX(-18px), opacity 0.15

@keyframes snow-fall
  0%: translateY(-20px) translateX(0), opacity 0
  15%: opacity 0.9
  100%: translateY(110vh) translateX(30px), opacity 0.2

@keyframes lightning-flash
  0%, 92%, 100%: background transparent
  93%: background rgba(255, 255, 255, 0.18)
  94%: background transparent
  96%: background rgba(255, 255, 255, 0.12)
  97%: background transparent

@keyframes fade-up
  from: opacity 0, transform translateY(12px)
  to: opacity 1, transform translateY(0)

Classes:
  .animate-rain
  .animate-snow
  .animate-lightning
  .animate-fade-up
  .animate-fade-up-delay-1 (0.08s delay)
  .animate-fade-up-delay-2 (0.16s delay)
  .animate-fade-up-delay-3 (0.24s delay)
```

## DATA FLOW

1. User opens app → App.tsx mounts with DEFAULT_CITY (Palo Alto)
2. useEffect triggers fetchWeather(Palo Alto, "F")
3. fetchWeather:
   - Calls 2 Open-Meteo APIs in parallel
   - Parses responses
   - Converts units (C→F, km/h→mph, etc.)
   - Returns WeatherBundle
4. App setState with data
5. Components receive data as props:
   - WeatherBackground gets condition
   - Hero section displays city/temp/summary
   - HourlyForecast gets hourly array
   - MetricCards gets all data
6. User searches city → SearchBar calls onSelect(newCity)
7. App updates city state → useEffect re-runs → new weather fetched → UI updates
8. User toggles F/C → units state changes → fetchWeather re-runs with new units
9. Animations play on mount (fade-up with staggered delays)

## WEATHER CODE MAPPINGS (WMO Standard)

```
0 = Clear sky
1 = Mainly clear
2 = Partly cloudy
3 = Overcast
45 = Foggy
48 = Depositing rime fog
51 = Light drizzle
53 = Moderate drizzle
55 = Dense drizzle
56 = Light freezing drizzle
57 = Dense freezing drizzle
61 = Slight rain
63 = Moderate rain
65 = Heavy rain
66 = Light freezing rain
67 = Heavy freezing rain
71 = Slight snow
73 = Moderate snow
75 = Heavy snow
77 = Snow grains
80 = Slight rain showers
81 = Moderate rain showers
82 = Violent rain showers
85 = Slight snow showers
86 = Heavy snow showers
95 = Thunderstorm
96 = Thunderstorm with slight hail
99 = Thunderstorm with heavy hail
```

## HOW TO ADD A FEATURE (Example: Pollen Alert)

1. Update types (src/types/weather.ts):
```typescript
interface PollenData {
  count: number;
  level: "low" | "moderate" | "high" | "extreme";
}

interface WeatherBundle {
  // ... existing fields
  pollen?: PollenData;
}
```

2. Update API (src/lib/api.ts):
```typescript
// In fetchWeather function, add:
const pollenUrl = new URL("https://pollen-api.com/forecast");
pollenUrl.searchParams.set("latitude", String(city.latitude));
pollenUrl.searchParams.set("longitude", String(city.longitude));

// After other API calls:
const pollenRes = await fetch(pollenUrl.toString());
let pollenData: PollenData | undefined;
if (pollenRes.ok) {
  const p = await pollenRes.json();
  pollenData = { count: p.data?.pollen_count, level: "high" };
}

// Return in WeatherBundle:
return { ..., pollen: pollenData };
```

3. Create component (src/components/PollenAlert.tsx):
```typescript
import type { PollenData } from "../types/weather";
import { GlassCard } from "./GlassCard";

export function PollenAlert({ pollen }: { pollen?: PollenData }) {
  if (!pollen) return null;
  
  const levelColor = {
    low: "text-green-400",
    moderate: "text-yellow-300",
    high: "text-orange-400",
    extreme: "text-red-500"
  };
  
  return (
    <GlassCard title="Pollen Count">
      <div className={`text-4xl font-light ${levelColor[pollen.level]}`}>
        {pollen.count}
      </div>
      <div className="mt-2 text-sm capitalize text-white/70">{pollen.level} level</div>
    </GlassCard>
  );
}
```

4. Import & use in App.tsx:
```typescript
import { PollenAlert } from "./components/PollenAlert";

// In MetricCards section of JSX:
{data && (
  <PollenAlert pollen={data.pollen} />
)}
```

5. Commit & push to main:
```bash
git add .
git commit -m "Add pollen alerts"
git push origin main
```
→ GitHub Actions auto-builds & deploys to Pages

## DEVELOPMENT COMMANDS

```bash
npm install                 # Install dependencies
npm run dev                 # Local dev server (localhost:5173)
npm run build               # Build for production (dist/ folder)
npm run preview             # Preview production build locally
```

## DEPLOYMENT

- All changes pushed to main branch → GitHub Actions `.github/workflows/deploy.yml` triggers
- Workflow: npm ci → npm run build → upload dist/ → deploy to GitHub Pages
- Live at: https://waldnerc34-dotcom.github.io/Atmos/
- Auto-deploys on every push to main

## KEY LIBRARIES

- react@19.2.6: UI framework
- react-dom@19.2.6: React for web
- tailwindcss@4.1.17: CSS framework
- typescript@5.9.3: Type safety
- vite@7.3.2: Build tool
- @tailwindcss/vite@4.1.17: Tailwind integration
- @vitejs/plugin-react@5.1.1: React JSX support
- clsx@2.1.1: Conditional classnames
- tailwind-merge@3.4.0: Merge tailwind classes

## GITHUB PAGES SETUP

1. Repo settings → Pages
2. Build and deployment → GitHub Actions
3. Workflow file: `.github/workflows/deploy.yml`
4. Creates gh-pages branch automatically
5. Domain: https://waldnerc34-dotcom.github.io/Atmos/

## COMMON PATTERNS IN CODE

Pattern 1: Fetch data on mount/change
```typescript
useEffect(() => {
  void load(city, units);
}, [city, units, load]);
```

Pattern 2: Safe optional chaining
```typescript
{data.daily[0]?.tempMax ?? "—"}
```

Pattern 3: Conditional rendering
```typescript
{loading && !data && <LoadingState />}
{error && !data && <ErrorState />}
{data && <MainContent />}
```

Pattern 4: Type-safe props
```typescript
interface Props {
  hourly: HourlyPoint[];
  timezone: string;
}

export function HourlyForecast({ hourly, timezone }: Props) { ... }
```

Pattern 5: Memoized computation
```typescript
const condition = useMemo(() => {
  if (!data) return "rain" as const;
  return getConditionKey(data.current.weatherCode, data.current.isDay);
}, [data]);
```

Pattern 6: Glass-morphism styling
```typescript
className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm backdrop-blur-xl transition hover:bg-white/15"
```

## QUICK REFERENCE - FILE PURPOSES

| File | Purpose | Key Exports |
|------|---------|-------------|
| App.tsx | Main component, state management, API calls | default App |
| SearchBar.tsx | City search + units toggle | SearchBar component |
| HourlyForecast.tsx | 24-hour forecast display | HourlyForecast component |
| DailyForecast.tsx | 10-day forecast | DailyForecast component |
| MetricCards.tsx | Detailed weather metrics (10 cards) | MetricCards component |
| WeatherBackground.tsx | Animated background + effects | WeatherBackground component |
| WeatherIcon.tsx | Weather condition icons | WeatherIcon component |
| GlassCard.tsx | Reusable glass container | GlassCard component |
| types/weather.ts | All TypeScript interfaces | WeatherBundle, CityResult, etc. |
| lib/api.ts | API calls to Open-Meteo | fetchWeather, searchCities, DEFAULT_CITY |
| lib/weatherCodes.ts | Utility functions | getConditionKey, getWeatherLabel, conversions |
| utils/cn.ts | Class name merge helper | cn function |
| index.css | Tailwind + custom animations | CSS keyframes |

---

**This file is for AI agents to understand the codebase structure, architecture, and patterns. Share with Grok or any other agent to help them contribute features correctly.**
