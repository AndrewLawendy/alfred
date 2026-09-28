import { Flex, Icon, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { TbCloudOff } from "react-icons/tb";

import { useOnline } from "utils/pwa";

// A pill at the top while offline; everything seen before still works
const OfflineBanner = () => {
  const isOnline = useOnline();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          style={{
            position: "fixed",
            top: "calc(env(safe-area-inset-top) + 8px)",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 1500,
            pointerEvents: "none",
          }}
        >
          <Flex
            sx={{
              alignItems: "center",
              gap: 2,
              px: 4,
              py: 2,
              borderRadius: "full",
              backgroundColor: "card",
              border: "1px solid",
              borderColor: "line",
              fontSize: "sm",
            }}
          >
            <Icon as={TbCloudOff} sx={{ w: 4, h: 4 }} />
            <Text>Offline — showing your saved outfits</Text>
          </Flex>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
