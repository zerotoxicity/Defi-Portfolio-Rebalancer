import { Image } from "@chakra-ui/react";

/**
 * Menu component that shows logout icon and text
 * @component
 */
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
