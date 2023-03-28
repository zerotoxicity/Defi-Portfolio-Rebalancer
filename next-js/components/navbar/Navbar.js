import { Box, Flex, Spacer, useColorModeValue } from "@chakra-ui/react";

import Logo from "./Logo";
import LoginButton from "./LoginButton";
import AuthContext from "store/auth-context";
import { useContext, useEffect } from "react";
import ProfileMenu from "./ProfileMenu";

/**
 * Navbar component that displays Rebalancer logo and name, and user details
 * @component
 */
const Navbar = () => {
  const authContext = useContext(AuthContext);

  //Request user to login if user has not logged in before
  useEffect(() => {
    if (localStorage.getItem("address") !== null) {
      authContext.login();
    }
  }, []);

  const profileButton = authContext.isLoggedIn ? (
    <ProfileMenu />
  ) : (
    <LoginButton />
  );
  return (
    <Box boxShadow={useColorModeValue("sm", "sm-dark")} p={1} bg="white">
      <Flex m={2} h={16} alignItems={"center"} justifyContent={"space-between"}>
        <Logo />
        <Spacer />
        {profileButton}
      </Flex>
    </Box>
  );
};

export default Navbar;
