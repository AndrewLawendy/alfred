import {
  IconButton,
  Icon,
  Button,
  FormControl,
  FormLabel,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import { useState } from "react";
import { MdAdd } from "react-icons/md";

import { Outfit } from "pages/Outfits";

import { outfitMock } from "pages/Home";

import { Item } from "pages/Outfits";

type AddOutfitProps = {
  onSubmit: (outfit: Outfit) => void;
};

const AddOutfit = ({ onSubmit }: AddOutfitProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [shirt, setShirt] = useState<Item>();
  const [belt, setBelt] = useState<Item>();
  const [pants, setPants] = useState<Item>();
  const [shoes, setShoes] = useState<Item>();

  const isValid = shirt && belt && pants && shoes;

  return (
    <>
      <Modal size="xs" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Outfit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <FormControl>
                <FormLabel>Shirt</FormLabel>
                <Select
                  placeholder="Pick your shirt"
                  onChange={() => {
                    setShirt(outfitMock.shirt);
                  }}
                >
                  <option value="12335">Green Shirt</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Belt</FormLabel>
                <Select
                  placeholder="Pick your belt"
                  onChange={() => {
                    setBelt(outfitMock.belt);
                  }}
                >
                  <option value="12335">Dark Brown Belt</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Pants</FormLabel>
                <Select
                  placeholder="Pick your pants"
                  onChange={() => {
                    setPants(outfitMock.pants);
                  }}
                >
                  <option value="12335">Jeans</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Shoes</FormLabel>
                <Select
                  placeholder="Pick your shoes"
                  onChange={() => {
                    setShoes(outfitMock.shoes);
                  }}
                >
                  <option value="12335">Safety Boots</option>
                </Select>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="teal"
              onClick={() => {
                onClose();
                isValid && onSubmit({ shirt, belt, pants, shoes });
              }}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <IconButton
        onClick={onOpen}
        aria-label="Add Outfit"
        size="lg"
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
          backgroundColor: "teal.300",
          position: "fixed",
          bottom: 16,
          right: 3,
          borderRadius: "full",
        }}
      />
    </>
  );
};

export default AddOutfit;
