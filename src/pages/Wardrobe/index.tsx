import { useState, useRef } from "react";
import { IconButton, Icon, Box, Stack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { MdAdd } from "react-icons/md";
import { RiShirtFill } from "react-icons/ri";
import { GiBelt, GiTrousers, GiRunningShoe } from "react-icons/gi";

const addOptions = [
  { label: "Add Shirt", icon: RiShirtFill },
  { label: "Add Bel", icon: GiBelt },
  { label: "Add Pants", icon: GiTrousers },
  { label: "Add Shoes", icon: GiRunningShoe },
];

const Wardrobe = () => {
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Box sx={{ position: "fixed", bottom: 16, right: 3 }}>
        <AnimatePresence mode="wait">
          {menuOpen && (
            <Stack sx={{ alignItems: "center", pb: 2 }}>
              {addOptions.map(({ label, icon }, index, arr) => {
                const delay = (arr.length - index) * 0.05;
                const exitDelay = index * 0.05;

                return (
                  <motion.div
                    key={label}
                    animate={{
                      transform: "scale(1)",
                      transition: {
                        type: "spring",
                        duration: 0.35,
                        delay,
                      },
                    }}
                    exit={{
                      transform: "scale(0)",
                      transition: {
                        duration: 0.1,
                        delay: exitDelay,
                      },
                    }}
                  >
                    <IconButton
                      colorScheme="whiteAlpha"
                      aria-label={label}
                      sx={{ borderRadius: "full", boxShadow: "material" }}
                      icon={
                        <Icon
                          as={icon}
                          color="blackAlpha.800"
                          sx={{
                            width: 5,
                            height: 5,
                          }}
                        />
                      }
                    />
                  </motion.div>
                );
              })}
            </Stack>
          )}
        </AnimatePresence>

        <IconButton
          ref={triggerButtonRef}
          aria-label="Add Wardrobe Item"
          size="lg"
          colorScheme="teal"
          onBlur={() => setMenuOpen(false)}
          onClick={() => {
            if (menuOpen) {
              setMenuOpen(false);
            } else {
              setMenuOpen(true);
              triggerButtonRef.current?.focus();
            }
          }}
          icon={
            <Icon
              as={MdAdd}
              color="white"
              sx={{
                width: 7,
                height: 7,
              }}
            />
          }
          sx={{
            boxShadow: "material",
            borderRadius: "full",
            transform: menuOpen ? "rotate(-45deg)" : undefined,
            transition: "transform 0.2s",
          }}
        />
      </Box>
    </>
  );
};

export default Wardrobe;
