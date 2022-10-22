import { Flex, Box, Image, Spinner, Text } from "@chakra-ui/react";

import useWeather from "resources/useWeather";

const Weather = () => {
  const { isLoading, data } = useWeather();
  const [weather] = data?.weather || [];

  if (isLoading || !data) {
    return <Spinner color="teal.400" />;
  }

  return (
    <Flex sx={{ alignItems: "center" }}>
      <Image
        alt="Weather Icon"
        src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
        sx={{ height: 12, width: 24, objectFit: "cover" }}
      />
      <Box>
        <Text sx={{ fontWeight: "semibold" }}>
          {Math.trunc(data.main.temp)}°C
        </Text>
        <Text fontSize="sm">{weather.main}</Text>
      </Box>
    </Flex>
  );
};

export default Weather;
