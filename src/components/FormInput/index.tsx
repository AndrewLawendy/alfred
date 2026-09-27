import {
  Input,
  InputGroup,
  InputRightAddon,
  InputProps,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

interface FormInputProps extends InputProps {
  label: string;
  error?: string | null;
  suffix?: string;
}

const FormInput = ({ label, error, suffix, ...props }: FormInputProps) => {
  return (
    <FormControl isInvalid={error !== null}>
      <FormLabel>{label}</FormLabel>
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
    </FormControl>
  );
};

export default FormInput;
