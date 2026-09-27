import { Flex, Icon, Skeleton, Text } from "@chakra-ui/react";
import { IconType } from "react-icons";
import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightAltCloudy,
  WiCloud,
  WiCloudy,
  WiShowers,
  WiDayRain,
  WiNightAltRain,
  WiThunderstorm,
  WiSnow,
  WiFog,
  WiThermometer,
} from "react-icons/wi";

import { WeatherResponse } from "resources/useWeather";

// Every OpenWeather icon code: https://openweathermap.org/weather-conditions
const icons: Record<string, IconType> = {
  "01d": WiDaySunny,
  "01n": WiNightClear,
  "02d": WiDayCloudy,
  "02n": WiNightAltCloudy,
  "03d": WiCloud,
  "03n": WiCloud,
  "04d": WiCloudy,
  "04n": WiCloudy,
  "09d": WiShowers,
  "09n": WiShowers,
  "10d": WiDayRain,
  "10n": WiNightAltRain,
  "11d": WiThunderstorm,
  "11n": WiThunderstorm,
  "13d": WiSnow,
  "13n": WiSnow,
  "50d": WiFog,
  "50n": WiFog,
};

type WeatherProps = {
  weatherData: WeatherResponse | undefined;
  isLoading: boolean;
};

const Weather = ({ weatherData, isLoading }: WeatherProps) => {
  const [weather] = weatherData?.weather || [];

  if (isLoading) {
    return <Skeleton height={10} width={32} borderRadius="full" />;
  }

  if (!weatherData || !weather) return null;

  return (
    <Flex
      sx={{
        flexShrink: 0,
        alignItems: "center",
        gap: 1.5,
        height: 10,
        pl: 2.5,
        pr: 4,
        borderRadius: "full",
        backgroundColor: "accent.50",
        color: "brand.800",
      }}
    >
      <Icon
        as={icons[weather.icon] || WiThermometer}
        aria-hidden
        sx={{ w: 7, h: 7, color: "accent.500" }}
      />
      <Text sx={{ fontWeight: "bold" }}>
        {Math.round(weatherData.main.temp)}°
      </Text>
      <Text sx={{ color: "brand.400", fontSize: "sm" }}>{weather.main}</Text>
    </Flex>
  );
};

export default Weather;
