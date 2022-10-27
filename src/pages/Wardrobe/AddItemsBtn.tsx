import { useRef, useState } from "react";
import { Box, BoxProps, IconButton, Icon, Stack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { MdAdd } from "react-icons/md";
import { IconType } from "react-icons";

interface AddItemsBtnProps extends BoxProps {
  setActiveModalIndex: (index: number) => void;
  addOptions: { label: string; icon: IconType }[];
}

const AddItemsBtn = ({
  setActiveModalIndex,
  addOptions,
  ...props
}: AddItemsBtnProps) => {
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Box {...props}>
      <AnimatePresence>
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
                    aria-label={label}
                    sx={{
                      borderRadius: "full",
                      boxShadow: "material",
                      backgroundColor: "white",
                    }}
                    onClick={() => setActiveModalIndex(index)}
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
  );
};

export default AddItemsBtn;
