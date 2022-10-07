import useFetch from "hooks.ts/useFetch";

export type WeatherResponse = {
  coord: Coord;
  weather: Weather[];
  base: string;
  main: Main;
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  dt: number;
  sys: Sys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
};

export interface Clouds {
  all: number;
}

export interface Coord {
  lon: number;
  lat: number;
}

export interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

export interface Sys {
  type: number;
  id: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface Wind {
  speed: number;
  deg: number;
}

type RequestPayload = {
  lat?: string;
  long?: string;
};

function getWeather({ lat = "30.0444", long = "31.2357" }) {
  return fetch(
    `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${long}&appid=${process.env.REACT_APP_WEATHER_API_ID}`
  ).then((res) => res.json());
}

const useWeather = (params: RequestPayload = {}) => {
  return useFetch<WeatherResponse>(() => getWeather(params));
};

export default useWeather;
