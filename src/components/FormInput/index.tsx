import {
  Input,
  InputGroup,
  InputRightAddon,
  InputProps,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

// `as` is left out: Input only renders an <input>
interface FormInputProps extends Omit<InputProps, "as"> {
  label: string;
  error?: string | null;
  suffix?: string;
  // Says "Optional" beside the label
  isOptional?: boolean;
  // A line of help under the field
  helper?: string;
}

const FormInput = ({
  label,
  error,
  suffix,
  isOptional,
  helper,
  ...props
}: FormInputProps) => {
  return (
    <FormControl isInvalid={error !== null}>
      <FormLabel
        sx={{ display: "flex", fontWeight: "semibold", fontSize: "sm", mr: 0 }}
      >
        {label}
        {isOptional && (
          <Text
            as="span"
            sx={{ ml: "auto", fontWeight: "normal", color: "gray.600" }}
          >
            Optional
          </Text>
        )}
      </FormLabel>
      <InputGroup>
        <Input {...props} />
        {suffix && <InputRightAddon>{suffix}</InputRightAddon>}
      </InputGroup>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 16.5 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <FormErrorMessage>{error}</FormErrorMessage>
          </motion.div>
        )}
      </AnimatePresence>
      {helper && (
        <Text sx={{ mt: 2, fontSize: "sm", color: "gray.600" }}>{helper}</Text>
      )}
    </FormControl>
  );
};

export default FormInput;
