import type { ConditionKey, WeatherCode } from "../types/weather";

export function getConditionKey(code: number, isDay = true): ConditionKey {
  if ([95, 96, 99].includes(code)) return "storm";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([56, 57, 66, 67].includes(code)) return "sleet";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "rain";
  if ([51, 53, 55].includes(code)) return "drizzle";
  if ([45, 48].includes(code)) return "fog";
  if (code === 3) return "cloudy";
  if (code === 2 || code === 1) return isDay ? "partly" : "night";
  if (code === 0) return isDay ? "clear" : "night";
  return isDay ? "cloudy" : "night";
}

export function getWeatherLabel(code: number): string {
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return map[code as WeatherCode] ?? "Unknown";
}

export function getBackgroundImage(key: ConditionKey): string {
  const images: Record<ConditionKey, string> = {
    clear: "/images/weather-sunny.jpg",
    partly: "/images/weather-sunny.jpg",
    cloudy: "/images/weather-cloudy.jpg",
    fog: "/images/weather-cloudy.jpg",
    drizzle: "/images/weather-rain.jpg",
    rain: "/images/weather-rain.jpg",
    snow: "/images/weather-snow.jpg",
    sleet: "/images/weather-snow.jpg",
    storm: "/images/weather-storm.jpg",
    night: "/images/weather-night.jpg",
  };
  return images[key];
}

export function getAqiInfo(aqi: number): { category: string; description: string } {
  if (aqi <= 50)
    return {
      category: "Good",
      description: "Air quality is good. Outdoor activities are ideal for everyone.",
    };
  if (aqi <= 100)
    return {
      category: "Moderate",
      description: "Acceptable air quality. Sensitive individuals should limit prolonged outdoor exertion.",
    };
  if (aqi <= 150)
    return {
      category: "Unhealthy for Sensitive",
      description: "Sensitive groups may experience health effects. Reduce outdoor activity if needed.",
    };
  if (aqi <= 200)
    return {
      category: "Unhealthy",
      description: "Everyone may begin to experience health effects. Limit outdoor exposure.",
    };
  if (aqi <= 300)
    return {
      category: "Very Unhealthy",
      description: "Health alert: everyone may experience more serious effects. Avoid outdoor activity.",
    };
  return {
    category: "Hazardous",
    description: "Emergency conditions. Stay indoors and keep windows closed.",
  };
}

export function getUvLabel(uv: number): string {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very High";
  return "Extreme";
}

export function getUvAdvice(uv: number): string {
  if (uv < 3) return "Cloud cover keeps UV exposure minimal — sunscreen still optional.";
  if (uv < 6) return "Moderate UV. Sunscreen recommended if outdoors for extended periods.";
  if (uv < 8) return "High UV. Wear sunscreen SPF 30+, hat, and seek shade midday.";
  if (uv < 11) return "Very high UV. Minimize sun exposure between 10am–4pm.";
  return "Extreme UV. Avoid outdoor exposure without full protection.";
}

export function buildSummary(
  code: number,
  precipProbNextHours: number,
  dailyPrecipProbs: number[]
): string {
  const label = getWeatherLabel(code).toLowerCase();
  const restOfWeekDry = dailyPrecipProbs.slice(1, 6).every((p) => p < 40);
  if (precipProbNextHours >= 50) {
    return `Rain for the next few hours, then clearing this afternoon. ${
      restOfWeekDry ? "Mostly dry the rest of the week." : "More showers possible later this week."
    }`;
  }
  if ([95, 96, 99].includes(code)) {
    return `Thunderstorms possible. Stay weather-aware and seek shelter if lightning approaches.`;
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return `Snowy conditions expected. Travel carefully and dress warmly.`;
  }
  return `Currently ${label}. ${
    restOfWeekDry
      ? "Mostly dry conditions look likely for the rest of the week."
      : "Some precipitation is possible later in the week."
  }`;
}

export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

export function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

export function mmToIn(mm: number): number {
  return mm / 25.4;
}

export function kmToMi(km: number): number {
  return km * 0.621371;
}

export function hPaToInHg(hpa: number): number {
  return hpa * 0.02953;
}

export function formatHour(iso: string, timezone: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: timezone,
  }).format(d);
}

export function formatDay(iso: string, timezone: string, index: number): string {
  if (index === 0) return "Today";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  }).format(d);
}

export function formatTime(iso: string, timezone: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(d);
}

export function windDirection(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}
