import { IconButton, Icon } from "@chakra-ui/react";
import { MdAdd } from "react-icons/md";

const Outfits = () => {
  return (
    <>
      <h1>Andre</h1>
      <IconButton
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

export default Outfits;
