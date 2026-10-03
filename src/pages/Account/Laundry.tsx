import { Box, Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import { MdAdd, MdRemove } from "react-icons/md";

import useNotice from "hooks/useNotice";
import useLimits, { saveLimits } from "resources/useLimits";
import { Limits } from "utils/laundry";

const types: { type: keyof Limits; label: string }[] = [
  { type: "shirt", label: "Shirts" },
  { type: "pants", label: "Pants" },
];

// How many wears each type takes before it goes in the hamper
const Laundry = () => {
  const limits = useLimits();
  const toast = useNotice();
  const change = (type: keyof Limits, by: number) => {
    saveLimits({
      ...limits,
      [type]: Math.min(10, Math.max(1, limits[type] + by)),
    }).catch(() =>
      toast({
        status: "error",
        title: "Couldn't save your laundry settings",
        description: "Nothing was changed. Please try again.",
      })
    );
  };

  return (
    <Box sx={{ mt: 5, p: 4, borderRadius: "card", backgroundColor: "card" }}>
      <Heading as="h2" sx={{ fontSize: "xl" }}>
        Laundry
      </Heading>
      <Text sx={{ mt: 1, color: "muted" }}>
        Wears before a piece goes in the hamper. Belts, shoes and jackets
        aren&apos;t counted.
      </Text>
      {types.map(({ type, label }) => (
        <Flex key={type} sx={{ mt: 4, alignItems: "center", gap: 3 }}>
          <Text sx={{ flex: 1, fontWeight: "semibold" }}>{label}</Text>
          <IconButton
            aria-label={`Fewer wears for ${label.toLowerCase()}`}
            icon={<MdRemove />}
            variant="outline"
            isDisabled={limits[type] <= 1}
            onClick={() => change(type, -1)}
          />
          <Text aria-live="polite" sx={{ w: 20, textAlign: "center" }}>
            {limits[type]} wear{limits[type] === 1 ? "" : "s"}
          </Text>
          <IconButton
            aria-label={`More wears for ${label.toLowerCase()}`}
            icon={<MdAdd />}
            variant="outline"
            isDisabled={limits[type] >= 10}
            onClick={() => change(type, 1)}
          />
        </Flex>
      ))}
    </Box>
  );
};

export default Laundry;
