import { useState } from "react";
import {
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  ExpandedIndex,
} from "@chakra-ui/react";

import { RiShirtFill } from "react-icons/ri";
import { GiBelt, GiTrousers, GiRunningShoe } from "react-icons/gi";

import AddItemsBtn from "./AddItemsBtn";
import Shirts from "./Shirts";

const addOptions = [
  { label: "Add Shirt", icon: RiShirtFill },
  { label: "Add Bel", icon: GiBelt },
  { label: "Add Pants", icon: GiTrousers },
  { label: "Add Shoes", icon: GiRunningShoe },
];

const Wardrobe = () => {
  const [activeItem, setActiveItem] = useState<ExpandedIndex>(0);
  const [activeModalIndex, setActiveModalIndex] = useState<number>();

  const pickActiveDrawer = (index: number) => {
    if (index === activeItem) {
      setActiveItem([]);
    } else {
      setActiveItem(index);
    }
  };

  return (
    <>
      <Accordion index={activeItem}>
        <AccordionItem>
          <AccordionButton onClick={() => pickActiveDrawer(0)}>
            <Heading as="h5" size="md" flex="1" textAlign="left">
              Shirts
            </Heading>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <Shirts
              modalIndex={0}
              activeModalIndex={activeModalIndex}
              setActiveModalIndex={setActiveModalIndex}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <AddItemsBtn
        sx={{ position: "fixed", bottom: 16, right: 3 }}
        addOptions={addOptions}
        setActiveModalIndex={setActiveModalIndex}
      />
    </>
  );
};

export default Wardrobe;
