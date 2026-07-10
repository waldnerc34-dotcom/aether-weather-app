import type {
  AirQuality,
  CityResult,
  CurrentWeather,
  DailyPoint,
  HourlyPoint,
  WeatherBundle,
} from "../types/weather";
import {
  buildSummary,
  cToF,
  getAqiInfo,
  hPaToInHg,
  kmhToMph,
  kmToMi,
  mmToIn,
} from "./weatherCodes";

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

export async function searchCities(query: string): Promise<CityResult[]> {
  if (!query.trim()) return [];
  const url = new URL(GEO_URL);
  url.searchParams.set("name", query.trim());
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("City search failed");
  const data = await res.json();
  if (!data.results) return [];

  return data.results.map(
    (r: {
      id: number;
      name: string;
      country: string;
      admin1?: string;
      latitude: number;
      longitude: number;
      timezone: string;
    }) => ({
      id: r.id,
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
    })
  );
}

function convertTemp(c: number, units: "F" | "C") {
  return units === "F" ? Math.round(cToF(c)) : Math.round(c);
}

function convertSpeed(kmh: number, units: "F" | "C") {
  return units === "F" ? Math.round(kmhToMph(kmh)) : Math.round(kmh);
}

function convertPrecip(mm: number, units: "F" | "C") {
  return units === "F" ? Number(mmToIn(mm).toFixed(2)) : Number(mm.toFixed(1));
}

function convertVis(km: number, units: "F" | "C") {
  return units === "F" ? Number(kmToMi(km).toFixed(1)) : Number(km.toFixed(1));
}

function convertPressure(hpa: number, units: "F" | "C") {
  return units === "F" ? Number(hPaToInHg(hpa).toFixed(2)) : Math.round(hpa);
}

export async function fetchWeather(
  city: CityResult,
  units: "F" | "C" = "F"
): Promise<WeatherBundle> {
  const weatherUrl = new URL(WEATHER_URL);
  weatherUrl.searchParams.set("latitude", String(city.latitude));
  weatherUrl.searchParams.set("longitude", String(city.longitude));
  weatherUrl.searchParams.set("timezone", city.timezone);
  weatherUrl.searchParams.set("forecast_days", "10");
  weatherUrl.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
    ].join(",")
  );
  weatherUrl.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "visibility",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "uv_index",
      "is_day",
    ].join(",")
  );
  weatherUrl.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
    ].join(",")
  );

  const airUrl = new URL(AIR_URL);
  airUrl.searchParams.set("latitude", String(city.latitude));
  airUrl.searchParams.set("longitude", String(city.longitude));
  airUrl.searchParams.set("timezone", city.timezone);
  airUrl.searchParams.set(
    "current",
    ["us_aqi", "pm2_5", "pm10", "ozone", "nitrogen_dioxide", "sulphur_dioxide", "carbon_monoxide"].join(
      ","
    )
  );

  const [weatherRes, airRes] = await Promise.all([
    fetch(weatherUrl.toString()),
    fetch(airUrl.toString()),
  ]);

  if (!weatherRes.ok) throw new Error("Weather fetch failed");
  const w = await weatherRes.json();

  let airQuality: AirQuality = {
    aqi: 0,
    pm25: 0,
    pm10: 0,
    ozone: 0,
    no2: 0,
    so2: 0,
    co: 0,
    category: "Good",
    description: "Air quality data unavailable.",
  };

  if (airRes.ok) {
    const a = await airRes.json();
    const aqi = Math.round(a.current?.us_aqi ?? 0);
    const info = getAqiInfo(aqi);
    airQuality = {
      aqi,
      pm25: Number((a.current?.pm2_5 ?? 0).toFixed(1)),
      pm10: Number((a.current?.pm10 ?? 0).toFixed(1)),
      ozone: Number((a.current?.ozone ?? 0).toFixed(1)),
      no2: Number((a.current?.nitrogen_dioxide ?? 0).toFixed(1)),
      so2: Number((a.current?.sulphur_dioxide ?? 0).toFixed(1)),
      co: Number((a.current?.carbon_monoxide ?? 0).toFixed(0)),
      category: info.category,
      description: info.description,
    };
  }

  const times: string[] = w.hourly.time;
  const now = new Date(w.current.time);
  let startIdx = times.findIndex((t: string) => new Date(t) >= now);
  if (startIdx < 0) startIdx = 0;

  const hourly: HourlyPoint[] = times.slice(startIdx, startIdx + 24).map((time: string, i: number) => {
    const idx = startIdx + i;
    return {
      time,
      temp: convertTemp(w.hourly.temperature_2m[idx], units),
      weatherCode: w.hourly.weather_code[idx],
      precipProb: w.hourly.precipitation_probability[idx] ?? 0,
      precip: convertPrecip(w.hourly.precipitation[idx] ?? 0, units),
      humidity: w.hourly.relative_humidity_2m[idx],
      windSpeed: convertSpeed(w.hourly.wind_speed_10m[idx], units),
      windGusts: convertSpeed(w.hourly.wind_gusts_10m[idx], units),
      windDir: w.hourly.wind_direction_10m[idx],
      uvIndex: Number((w.hourly.uv_index[idx] ?? 0).toFixed(1)),
      cloudCover: w.hourly.cloud_cover[idx],
      pressure: convertPressure(w.hourly.pressure_msl[idx], units),
      visibility: convertVis((w.hourly.visibility[idx] ?? 10000) / 1000, units),
      feelsLike: convertTemp(w.hourly.apparent_temperature[idx], units),
      isDay: Boolean(w.hourly.is_day[idx]),
    };
  });

  const daily: DailyPoint[] = w.daily.time.map((date: string, i: number) => ({
    date,
    weatherCode: w.daily.weather_code[i],
    tempMax: convertTemp(w.daily.temperature_2m_max[i], units),
    tempMin: convertTemp(w.daily.temperature_2m_min[i], units),
    precipProb: w.daily.precipitation_probability_max[i] ?? 0,
    precipSum: convertPrecip(w.daily.precipitation_sum[i] ?? 0, units),
    uvIndexMax: Number((w.daily.uv_index_max[i] ?? 0).toFixed(1)),
    sunrise: w.daily.sunrise[i],
    sunset: w.daily.sunset[i],
    windSpeedMax: convertSpeed(w.daily.wind_speed_10m_max[i], units),
    windGustsMax: convertSpeed(w.daily.wind_gusts_10m_max[i], units),
  }));

  // Use current hour UV / visibility from hourly nearest
  const nearestUv = hourly[0]?.uvIndex ?? 0;
  const nearestVis = hourly[0]?.visibility ?? (units === "F" ? 10 : 16);

  const current: CurrentWeather = {
    time: w.current.time,
    temp: convertTemp(w.current.temperature_2m, units),
    feelsLike: convertTemp(w.current.apparent_temperature, units),
    humidity: w.current.relative_humidity_2m,
    weatherCode: w.current.weather_code,
    isDay: Boolean(w.current.is_day),
    windSpeed: convertSpeed(w.current.wind_speed_10m, units),
    windGusts: convertSpeed(w.current.wind_gusts_10m, units),
    windDir: w.current.wind_direction_10m,
    pressure: convertPressure(w.current.pressure_msl, units),
    cloudCover: w.current.cloud_cover,
    precip: convertPrecip(w.current.precipitation, units),
    visibility: nearestVis,
    uvIndex: nearestUv,
  };

  const precipNext = Math.max(...hourly.slice(0, 6).map((h) => h.precipProb), 0);
  const summary = buildSummary(
    current.weatherCode,
    precipNext,
    daily.map((d) => d.precipProb)
  );

  return {
    city,
    current,
    hourly,
    daily,
    airQuality,
    summary,
    units,
  };
}

export const DEFAULT_CITY: CityResult = {
  id: 5380748,
  name: "Palo Alto",
  country: "United States",
  admin1: "California",
  latitude: 37.4419,
  longitude: -122.143,
  timezone: "America/Los_Angeles",
};
