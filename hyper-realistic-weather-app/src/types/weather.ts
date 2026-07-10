export type WeatherCode =
  | 0
  | 1
  | 2
  | 3
  | 45
  | 48
  | 51
  | 53
  | 55
  | 56
  | 57
  | 61
  | 63
  | 65
  | 66
  | 67
  | 71
  | 73
  | 75
  | 77
  | 80
  | 81
  | 82
  | 85
  | 86
  | 95
  | 96
  | 99;

export type ConditionKey =
  | "clear"
  | "partly"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "sleet"
  | "storm"
  | "night";

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
