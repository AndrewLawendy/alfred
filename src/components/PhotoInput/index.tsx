import { useState } from "react";
import {
  Input,
  InputProps,
  Image,
  Box,
  Button,
  Flex,
  Text,
  Icon,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { BsCameraFill } from "react-icons/bs";
import { MdAddAPhoto, MdPhotoLibrary } from "react-icons/md";

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
  const [imgSrc, setImgSrc] = useState<string>(initialImageUrl);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImgSrc(URL.createObjectURL(file));
      onChange(file);
      onBlur?.();
    }
  };

  // Labels open the hidden file inputs: camera first, then the photo library
  const source = (id: string, label: string, icon: typeof MdAddAPhoto) => (
    <Button
      as="label"
      htmlFor={id}
      variant="outline"
      size="lg"
      leftIcon={<Icon as={icon} sx={{ w: 5, h: 5 }} />}
      isDisabled={disabled}
      sx={{ flex: 1, px: 3, cursor: "pointer" }}
    >
      {label}
    </Button>
  );

  return (
    <Box>
      <Box
        as="label"
        htmlFor="upload-shot"
        sx={{
          display: "block",
          width: "100%",
          overflow: "hidden",
          border: "1px solid",
          borderRadius: "card",
          cursor: "pointer",
          backgroundColor: "card",
          borderColor: error ? "red.500" : "transparent",
          boxShadow: error
            ? "0 0 0 1px var(--chakra-colors-red-500)"
            : undefined,
        }}
      >
        {imgSrc ? (
          <Image src={imgSrc} alt="" w="100%" />
        ) : (
          <Flex
            sx={{
              aspectRatio: "4 / 3",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              px: 6,
              textAlign: "center",
              color: "gray.600",
            }}
          >
            <Icon as={MdAddAPhoto} w={10} h={10} />
            <Text sx={{ fontSize: "sm" }}>
              Lay it flat in good light, on a plain background.
            </Text>
          </Flex>
        )}
      </Box>

      <Flex sx={{ gap: 2, mt: 3 }}>
        {source("take-shot", imgSrc ? "Retake" : "Take photo", BsCameraFill)}
        {source(
          "upload-shot",
          imgSrc ? "Choose another" : "From gallery",
          MdPhotoLibrary
        )}
      </Flex>
      <Input
        {...props}
        sx={{ display: "none" }}
        id="take-shot"
        accept="image/*"
        type="file"
        capture="environment"
        onChange={handleChange}
        disabled={disabled}
      />
      <Input
        {...props}
        sx={{ display: "none" }}
        id="upload-shot"
        accept="image/*"
        type="file"
        onChange={handleChange}
        disabled={disabled}
      />

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
                color: "red.600",
                fontSize: "sm",
                lineHeight: "normal",
              }}
            >
              {error}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default PhotoInput;
