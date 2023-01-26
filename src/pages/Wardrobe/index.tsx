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
import WardrobeItem from "./WardrobeItem";
import JacketsForm from "./JacketsForm";

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
            <WardrobeItem
              type="shirt"
              modalIndex={0}
              activeModalIndex={activeModalIndex}
              setActiveModalIndex={setActiveModalIndex}
            />
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
              modalIndex={1}
              activeModalIndex={activeModalIndex}
              setActiveModalIndex={setActiveModalIndex}
              formData={{ maxTemperature: "" }}
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
            <WardrobeItem
              type="belt"
              modalIndex={2}
              activeModalIndex={activeModalIndex}
              setActiveModalIndex={setActiveModalIndex}
            />
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
            <WardrobeItem
              type="pants"
              modalIndex={3}
              activeModalIndex={activeModalIndex}
              setActiveModalIndex={setActiveModalIndex}
            />
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
            <WardrobeItem
              type="shoes"
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
