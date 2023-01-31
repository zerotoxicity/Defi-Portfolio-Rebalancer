import { Image } from "@chakra-ui/react";

const LogOutMenuItem = () => {
  return (
    <>
      <Image
        src="icons/logout.png"
        boxSize="2rem"
        borderRadius="full"
        mr="12px"
      />
      <span>Log out</span>
    </>
  );
};

export default LogOutMenuItem;
