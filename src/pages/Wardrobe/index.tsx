import { useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { Box, Button, Flex, Icon, Text } from "@chakra-ui/react";
import { MdAdd } from "react-icons/md";

import useData from "resources/useData";
import { Item } from "utils/types";

import WardrobeItem from "./WardrobeItem";
import JacketsForm from "./JacketsForm";

const tabs: { type: Item["type"]; label: string; singular: string }[] = [
  { type: "shirt", label: "Shirts", singular: "shirt" },
  { type: "jacket", label: "Jackets", singular: "jacket" },
  { type: "belt", label: "Belts", singular: "belt" },
  { type: "pants", label: "Pants", singular: "pants" },
  { type: "shoes", label: "Shoes", singular: "shoes" },
];

const Wardrobe = () => {
  const [, navigate] = useLocation();
  // The tab lives in the URL (/wardrobe/:type/...), so deep links open the right one
  const [, params] = useRoute("/:type/:rest*");
  const active = tabs.find(({ type }) => type === params?.type) || tabs[0];
  const [allItems] = useData<Item>("wardrobe-items");
  const counts = useMemo(
    () =>
      (allItems || []).reduce<Record<string, number>>((acc, { type }) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
    [allItems]
  );

  return (
    <>
      <Flex
        role="tablist"
        sx={{
          gap: 2,
          mx: -3,
          px: 3,
          mb: 4,
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {tabs.map(({ type, label }) => {
          const isActive = type === active.type;
          return (
            <Button
              key={type}
              role="tab"
              aria-selected={isActive}
              onClick={() => navigate(`/${type}`, { replace: true })}
              size="sm"
              variant="outline"
              sx={{
                flexShrink: 0,
                borderRadius: "full",
                fontWeight: isActive ? "semibold" : "medium",
                borderColor: isActive ? "teal.500" : "gray.200",
                backgroundColor: isActive ? "teal.50" : "white",
                color: isActive ? "teal.800" : "gray.600",
              }}
            >
              {label}
              <Text
                as="span"
                sx={{ ml: 1.5, color: isActive ? "teal.500" : "gray.400" }}
              >
                {counts[type] || 0}
              </Text>
            </Button>
          );
        })}
      </Flex>

      <Box role="tabpanel">
        {active.type === "jacket" ? (
          <WardrobeItem
            key="jacket"
            type="jacket"
            formData={{
              maxTemperature: { initialValue: "", isRequired: true },
            }}
          >
            {(props) => <JacketsForm {...props} />}
          </WardrobeItem>
        ) : (
          <WardrobeItem key={active.type} type={active.type} />
        )}
      </Box>

      <Button
        onClick={() => navigate(`/${active.type}/new`)}
        leftIcon={<Icon as={MdAdd} w={6} h={6} />}
        colorScheme="teal"
        size="lg"
        sx={{
          position: "fixed",
          bottom: "nav",
          right: 3,
          borderRadius: "full",
          boxShadow: "material",
        }}
      >
        Add {active.singular}
      </Button>
    </>
  );
};

export default Wardrobe;
