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

import { IconType } from "react-icons";
import { RiShirtFill } from "react-icons/ri";
import {
  GiSleevelessJacket,
  GiBelt,
  GiTrousers,
  GiRunningShoe,
} from "react-icons/gi";

import { Item } from "utils/types";

import AddItemsBtn from "./AddItemsBtn";
import WardrobeItem from "./WardrobeItem";
import JacketsForm from "./JacketsForm";

export interface AddOption extends Pick<Item, "type"> {
  label: string;
  icon: IconType;
}

const addOptions: AddOption[] = [
  { label: "Add Shirt", type: "shirt", icon: RiShirtFill },
  { label: "Add Jacket", type: "jacket", icon: GiSleevelessJacket },
  { label: "Add Bel", type: "belt", icon: GiBelt },
  { label: "Add Pants", type: "pants", icon: GiTrousers },
  { label: "Add Shoes", type: "shoes", icon: GiRunningShoe },
];

const Wardrobe = () => {
  const [activeItem, setActiveItem] = useState<ExpandedIndex>(0);

  const pickActiveDrawer = (index: number) => {
    if (index === activeItem) {
      setActiveItem([]);
    } else {
      setActiveItem(index);
    }
  };

  return (
    <>
      <Accordion index={activeItem} sx={{ backgroundColor: "white" }}>
        <AccordionItem>
          <AccordionButton
            onClick={() => pickActiveDrawer(0)}
            sx={{ boxShadow: activeItem === 0 ? "material" : undefined }}
          >
            <Heading as="h5" size="md" flex="1" textAlign="left">
              Shirts
            </Heading>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <WardrobeItem type="shirt" />
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton
            onClick={() => pickActiveDrawer(1)}
            sx={{ boxShadow: activeItem === 1 ? "material" : undefined }}
          >
            <Heading as="h5" size="md" flex="1" textAlign="left">
              Jackets
            </Heading>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <WardrobeItem
              type="jacket"
              formData={{
                maxTemperature: { initialValue: "", isRequired: true },
              }}
            >
              {(props) => <JacketsForm {...props} />}
            </WardrobeItem>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton
            onClick={() => pickActiveDrawer(2)}
            sx={{ boxShadow: activeItem === 2 ? "material" : undefined }}
          >
            <Heading as="h5" size="md" flex="1" textAlign="left">
              Belts
            </Heading>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <WardrobeItem type="belt" />
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton
            onClick={() => pickActiveDrawer(3)}
            sx={{ boxShadow: activeItem === 3 ? "material" : undefined }}
          >
            <Heading as="h5" size="md" flex="1" textAlign="left">
              Pants
            </Heading>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <WardrobeItem type="pants" />
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton
            onClick={() => pickActiveDrawer(4)}
            sx={{ boxShadow: activeItem === 4 ? "material" : undefined }}
          >
            <Heading as="h5" size="md" flex="1" textAlign="left">
              Shoes
            </Heading>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <WardrobeItem type="shoes" />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <AddItemsBtn
        sx={{ position: "fixed", bottom: 16, right: 3 }}
        addOptions={addOptions}
      />
    </>
  );
};

export default Wardrobe;
