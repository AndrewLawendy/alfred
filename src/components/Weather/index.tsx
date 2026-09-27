import { Flex, Box, Image, Skeleton, Text } from "@chakra-ui/react";

import { WeatherResponse } from "resources/useWeather";

type WeatherProps = {
  weatherData: WeatherResponse | undefined;
  isLoading: boolean;
};

const Weather = ({ weatherData, isLoading }: WeatherProps) => {
  const [weather] = weatherData?.weather || [];

  if (isLoading) {
    return <Skeleton height={12} width={36} borderRadius="md" />;
  }

  if (!weatherData || !weather) return null;

  return (
    <Flex sx={{ alignItems: "center" }}>
      <Image
        alt="Weather Icon"
        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
        sx={{ height: 12, width: 24, objectFit: "cover" }}
      />
      <Box>
        <Text sx={{ fontWeight: "semibold" }}>
          {Math.trunc(weatherData.main.temp)}°C
        </Text>
        <Text fontSize="sm">{weather.main}</Text>
      </Box>
    </Flex>
  );
};

export default Weather;
