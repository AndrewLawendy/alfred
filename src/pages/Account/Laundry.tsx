import { Box, Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import { MdAdd, MdRemove } from "react-icons/md";

import useNotice from "hooks/useNotice";
import { saveLimits, useLimitsState } from "resources/useLimits";
import { CATEGORIES } from "utils/wardrobe";
import { Category } from "utils/types";

// Outerwear is the daily weather pick, never counted
const types = CATEGORIES.filter(({ inOutfit }) => inOutfit);

// 0 is "Not counted", the lowest step
const MAX = 10;
const describe = (limit: number) =>
  limit === 0 ? "Not counted" : `${limit} wear${limit === 1 ? "" : "s"}`;

// How many wears each category takes before it goes in the hamper
const Laundry = () => {
  const { limits, isLoading } = useLimitsState();
  const toast = useNotice();
  const limitOf = (type: Category) => limits[type] ?? 0;
  const change = (type: Category, by: number) => {
    saveLimits({
      [type]: Math.min(MAX, Math.max(0, limitOf(type) + by)),
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
        Wears before a piece goes in the hamper. A piece can set its own in its
        details.
      </Text>
      {types.map(({ key, plural }) => (
        <Flex key={key} sx={{ mt: 4, alignItems: "center", gap: 3 }}>
          <Text sx={{ flex: 1, fontWeight: "semibold" }}>{plural}</Text>
          <IconButton
            aria-label={`Fewer wears for ${plural.toLowerCase()}`}
            icon={<MdRemove />}
            variant="outline"
            isDisabled={isLoading || limitOf(key) <= 0}
            onClick={() => change(key, -1)}
          />
          <Text aria-live="polite" sx={{ w: 24, textAlign: "center" }}>
            {describe(limitOf(key))}
          </Text>
          <IconButton
            aria-label={`More wears for ${plural.toLowerCase()}`}
            icon={<MdAdd />}
            variant="outline"
            isDisabled={isLoading || limitOf(key) >= MAX}
            onClick={() => change(key, 1)}
          />
        </Flex>
      ))}
    </Box>
  );
};

export default Laundry;
