import {
  Input,
  InputProps,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

interface FormInputProps extends InputProps {
  label: string;
  error?: string | null;
}

const FormInput = ({ label, error, ...props }: FormInputProps) => {
  return (
    <FormControl isInvalid={error !== null}>
      <FormLabel>{label}</FormLabel>
      <Input {...props} />
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
