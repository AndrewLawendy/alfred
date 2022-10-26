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
import {
  GiSleevelessJacket,
  GiBelt,
  GiTrousers,
  GiRunningShoe,
} from "react-icons/gi";

import AddItemsBtn from "./AddItemsBtn";
import Shirts from "./Shirts";
import Jackets from "./Jackets";
import Belts from "./Belts";
import Pants from "./Pants";
import Shoes from "./Shoes";

const addOptions = [
  { label: "Add Shirt", icon: RiShirtFill },
  { label: "Add Jacket", icon: GiSleevelessJacket },
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

        <AccordionItem>
          <AccordionButton onClick={() => pickActiveDrawer(1)}>
            <Heading as="h5" size="md" flex="1" textAlign="left">
              Jackets
            </Heading>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <Jackets
              modalIndex={1}
              activeModalIndex={activeModalIndex}
              setActiveModalIndex={setActiveModalIndex}
            />
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton onClick={() => pickActiveDrawer(2)}>
            <Heading as="h5" size="md" flex="1" textAlign="left">
              Belts
            </Heading>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <Belts
              modalIndex={2}
              activeModalIndex={activeModalIndex}
              setActiveModalIndex={setActiveModalIndex}
            />
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton onClick={() => pickActiveDrawer(3)}>
            <Heading as="h5" size="md" flex="1" textAlign="left">
              Pants
            </Heading>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <Pants
              modalIndex={3}
              activeModalIndex={activeModalIndex}
              setActiveModalIndex={setActiveModalIndex}
            />
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton onClick={() => pickActiveDrawer(4)}>
            <Heading as="h5" size="md" flex="1" textAlign="left">
              Shoes
            </Heading>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <Shoes
              modalIndex={4}
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
