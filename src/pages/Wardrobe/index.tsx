import { useEffect, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { Box, Button, Flex, Icon, Text, useDisclosure } from "@chakra-ui/react";
import { MdAdd } from "react-icons/md";

import HamperSheet from "components/HamperSheet";
import HamperCard from "components/HamperSheet/HamperCard";
import PageHeader, { COMPACT_BAR_HEIGHT } from "components/PageHeader";
import useWardrobe from "resources/useWardrobe";
import useLimits from "resources/useLimits";
import { inHamper } from "utils/laundry";
import { openNewItem } from "utils/history";
import { CATEGORIES, tabFor } from "utils/wardrobe";
import { Item } from "utils/types";

import WardrobeItem from "./WardrobeItem";
import AddChooser from "./AddChooser";

const tabs: { type: Item["type"]; label: string; singular: string }[] =
  CATEGORIES.map(({ key, label, plural }) => ({
    type: key,
    label: plural,
    singular: label.toLowerCase(),
  }));

const Wardrobe = () => {
  const [, navigate] = useLocation();
  // The tab lives in the URL (/wardrobe/:type/...), so deep links open the right one
  const [, params] = useRoute("/:type/:rest*");
  const activeType = tabFor(params?.type);
  const active = tabs.find(({ type }) => type === activeType) || tabs[0];
  // Old item links (/wardrobe/<type>/<id> or /new) now open the item on top of the tab
  const [isOldItemLink, oldLink] = useRoute("/:type/:item");
  useEffect(() => {
    if (!isOldItemLink || !oldLink) return;
    const type = tabFor(oldLink.type);
    const query =
      oldLink.item === "new"
        ? `new=${type}`
        : `item=${encodeURIComponent(oldLink.item)}`;
    navigate(`/${type}?${query}`, { replace: true });
  }, [isOldItemLink, oldLink?.type, oldLink?.item]);
  // Old tab names (/wardrobe/shirt) move to their category
  useEffect(() => {
    if (isOldItemLink || !params?.type || params.type === activeType) return;
    navigate(`/${activeType}${window.location.search}`, { replace: true });
  }, [isOldItemLink, params?.type, activeType]);
  const [allItems] = useWardrobe();
  const limits = useLimits();
  const hamper = inHamper(allItems || [], limits);
  const {
    isOpen: isHamperOpen,
    onOpen: onHamperOpen,
    onClose: onHamperClose,
  } = useDisclosure();
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
      {/* A status, not a type: a card above the tabs, only while there's
          something to wash */}
      <HamperCard pieces={hamper} onOpen={onHamperOpen} />
      <Flex
        role="tablist"
        sx={{
          // Sticks under the slim title bar, so the type can change anywhere
          // in a long list
          position: "sticky",
          top: `calc(env(safe-area-inset-top) + ${COMPACT_BAR_HEIGHT})`,
          zIndex: "docked",
          gap: 2,
          mx: -3,
          px: 3,
          py: 2,
          mb: 3,
          backgroundColor: "pageGlass",
          backdropFilter: "blur(12px)",
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
      <HamperSheet isOpen={isHamperOpen} onClose={onHamperClose} />
    </>
  );
};

export default Wardrobe;
