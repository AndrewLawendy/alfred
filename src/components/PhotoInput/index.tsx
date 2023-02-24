import { useState, useRef } from "react";
import {
  Input,
  InputProps,
  Image,
  Box,
  Text,
  Icon,
  FormLabel,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  Grid,
  GridItem,
  useDisclosure,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { BsCameraFill } from "react-icons/bs";
import { GrGallery } from "react-icons/gr";

interface PhotoInputProps extends Omit<InputProps, "onChange"> {
  onChange: (file: File) => void;
  onBlur?: () => void;
  disabled?: boolean;
  initialImageUrl?: string;
  error?: string | null;
}

const PhotoInput = ({
  initialImageUrl = "",
  onChange,
  onBlur,
  disabled,
  error,
  ...props
}: PhotoInputProps) => {
  const photoDrawerRef = useRef(null);
  const [imgSrc, setImgSrc] = useState<string>(initialImageUrl);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newUrl = URL.createObjectURL(file);
      setImgSrc(newUrl);
      onClose();
      onChange(file);
    }
  };

  return (
    <>
      <Box sx={{ textAlign: "center" }}>
        <Box
          as="button"
          onClick={onOpen}
          disabled={disabled}
          sx={{
            width: "80vw",
            border: "1px solid",
            borderRadius: "md",
            borderColor: error ? "red.500" : "gray.200",
            boxShadow: error
              ? "0 0 0 1px var(--chakra-colors-red-500)"
              : undefined,
          }}
        >
          {imgSrc ? (
            <Image src={imgSrc} w="100%" />
          ) : (
            <Text sx={{ height: "80vw", lineHeight: "80vw" }}>
              Tap to add a photo
            </Text>
          )}
        </Box>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 16.5 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Text
                sx={{
                  mt: 2,
                  color: "red.500",
                  fontSize: "sm",
                  lineHeight: "normal",
                  textAlign: "left",
                }}
              >
                {error}
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Box ref={photoDrawerRef}>
        <Drawer
          placement="bottom"
          onClose={onClose}
          isOpen={isOpen}
          portalProps={{ containerRef: photoDrawerRef }}
          onCloseComplete={onBlur}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerBody>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem sx={{ height: "40vw" }}>
                  <Input
                    {...props}
                    sx={{ display: "none" }}
                    id="take-shot"
                    accept="image/*"
                    type="file"
                    capture="environment"
                    onChange={handleChange}
                  />
                  <FormLabel
                    htmlFor="take-shot"
                    sx={{
                      m: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon w={8} h={8} mb={4} as={BsCameraFill} />
                    <Text>Take a photo</Text>
                  </FormLabel>
                </GridItem>

                <GridItem sx={{ height: "40vw" }}>
                  <Input
                    {...props}
                    sx={{ display: "none" }}
                    id="upload-shot"
                    accept="image/*"
                    type="file"
                    onChange={handleChange}
                  />
                  <FormLabel
                    htmlFor="upload-shot"
                    sx={{
                      m: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon w={8} h={8} mb={4} as={GrGallery} />
                    <Text>Upload from gallery</Text>
                  </FormLabel>
                </GridItem>
              </Grid>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </>
  );
};

export default PhotoInput;
