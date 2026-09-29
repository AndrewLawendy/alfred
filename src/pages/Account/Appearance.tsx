import { Box, Button, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { TbDeviceMobile, TbMoon, TbSun } from "react-icons/tb";

import { setAppearance, useAppearance } from "hooks/useAppearance";
import { Appearance as AppearanceChoice } from "utils/appearance";

const choices: {
  value: AppearanceChoice;
  label: string;
  icon: typeof TbSun;
}[] = [
  { value: "system", label: "System", icon: TbDeviceMobile },
  { value: "light", label: "Light", icon: TbSun },
  { value: "dark", label: "Dark", icon: TbMoon },
];

// Light, dark, or following the phone (the default)
const Appearance = () => {
  const appearance = useAppearance();

  return (
    <Box sx={{ mt: 5, p: 4, borderRadius: "card", backgroundColor: "card" }}>
      <Heading as="h2" id="appearance" sx={{ fontSize: "xl" }}>
        Appearance
      </Heading>
      <Text sx={{ mt: 1, color: "muted" }}>
        Light, dark, or the same as your phone.
      </Text>
      <Flex
        role="radiogroup"
        aria-labelledby="appearance"
        sx={{ mt: 4, gap: 1, p: 1, borderRadius: "full", bg: "page" }}
      >
        {choices.map(({ value, label, icon }) => {
          const isPicked = appearance === value;
          return (
            <Button
              key={value}
              role="radio"
              aria-checked={isPicked}
              onClick={() => setAppearance(value)}
              leftIcon={<Icon as={icon} sx={{ w: 5, h: 5 }} />}
              sx={{
                flex: 1,
                minW: 0,
                px: 2,
                backgroundColor: isPicked ? "ink" : "transparent",
                color: isPicked ? "card" : "ink",
                _hover: { backgroundColor: isPicked ? "ink" : "transparent" },
              }}
            >
              {label}
            </Button>
          );
        })}
      </Flex>
    </Box>
  );
};

export default Appearance;
