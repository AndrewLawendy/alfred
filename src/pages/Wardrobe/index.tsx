import { useEffect, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { Box, Button, Flex, Icon, Text } from "@chakra-ui/react";
import { MdAdd } from "react-icons/md";

import PageHeader from "components/PageHeader";
import useData from "resources/useData";
import { openNewItem } from "utils/history";
import { Item } from "utils/types";

import WardrobeItem from "./WardrobeItem";
import AddChooser from "./AddChooser";

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
  // Old item links (/wardrobe/<type>/<id> or /new) now open the item on top of the tab
  const [isOldItemLink, oldLink] = useRoute("/:type/:item");
  useEffect(() => {
    if (!isOldItemLink || !oldLink) return;
    const query =
      oldLink.item === "new"
        ? `new=${oldLink.type}`
        : `item=${encodeURIComponent(oldLink.item)}`;
    navigate(`/${oldLink.type}?${query}`, { replace: true });
  }, [isOldItemLink, oldLink?.type, oldLink?.item]);
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
      <PageHeader
        title="Wardrobe"
        eyebrow={
          allItems
            ? `${allItems.length} piece${allItems.length === 1 ? "" : "s"}`
            : undefined
        }
        action={
          <Button
            onClick={() => openNewItem(active.type)}
            leftIcon={<Icon as={MdAdd} sx={{ w: 5, h: 5 }} />}
            colorScheme="brand"
            sx={{ flexShrink: 0 }}
          >
            Add {active.singular}
          </Button>
        }
      />
      <Flex
        role="tablist"
        sx={{
          gap: 2,
          mx: -3,
          px: 3,
          mb: 5,
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
              sx={{
                flexShrink: 0,
                fontWeight: "medium",
                backgroundColor: isActive ? "ink" : "card",
                color: isActive ? "card" : "ink",
                _hover: { backgroundColor: isActive ? "ink" : "card" },
              }}
            >
              {label}
              <Text
                as="span"
                sx={{ ml: 1.5, color: isActive ? "onInkMuted" : "muted" }}
              >
                {counts[type] || 0}
              </Text>
            </Button>
          );
        })}
      </Flex>

      <Box role="tabpanel">
        <WardrobeItem key={active.type} type={active.type} />
      </Box>

      <AddChooser />
    </>
  );
};

export default Wardrobe;
