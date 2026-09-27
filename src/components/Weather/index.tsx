import { Flex, Image, Skeleton, Text } from "@chakra-ui/react";

import { WeatherResponse } from "resources/useWeather";

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
        gap: 1,
        pr: 3,
        borderRadius: "full",
        backgroundColor: "gray.100",
      }}
    >
      <Image
        alt=""
        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
        // Render nothing instead of a broken image while loading or on error
        fallback={<></>}
        sx={{ height: 10, width: 10 }}
      />
      <Text sx={{ fontWeight: "semibold" }}>
        {Math.trunc(weatherData.main.temp)}°C
      </Text>
      <Text sx={{ color: "gray.600" }}>· {weather.main}</Text>
    </Flex>
  );
};

export default Weather;
