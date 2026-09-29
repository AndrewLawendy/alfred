import { Box, Flex, Icon, Skeleton, Text } from "@chakra-ui/react";
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
  // What the weather means for today, e.g. "Two jackets would suit"
  verdict?: string;
};

const Weather = ({ weatherData, isLoading, verdict }: WeatherProps) => {
  const [weather] = weatherData?.weather || [];

  if (isLoading) {
    return <Skeleton height={14} borderRadius="card" />;
  }

  if (!weatherData || !weather) return null;

  return (
    <Flex
      sx={{
        alignItems: "center",
        gap: 3,
        minH: 14,
        px: 3,
        py: 2,
        borderRadius: "card",
        backgroundColor: "card",
        color: "brand.500",
      }}
    >
      <Icon
        as={icons[weather.icon] || WiThermometer}
        aria-hidden
        sx={{ w: 9, h: 9, flexShrink: 0, color: "accent.500" }}
      />
      <Text sx={{ fontFamily: "heading", fontSize: "3xl", lineHeight: 1 }}>
        {Math.round(weatherData.main.temp)}°
      </Text>
      <Box sx={{ minW: 0, lineHeight: "short" }}>
        <Text sx={{ fontSize: "sm", color: "gray.600" }}>{weather.main}</Text>
        {verdict && (
          <Text noOfLines={1} sx={{ fontWeight: "medium" }}>
            {verdict}
          </Text>
        )}
      </Box>
    </Flex>
  );
};

export default Weather;
