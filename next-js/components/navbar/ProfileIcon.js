import { useContext, useEffect, useRef, useState } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Heading, Box, Stack, Text } from "@chakra-ui/react";
import AuthContext from "store/auth-context";
import { ChevronDownIcon } from "@chakra-ui/icons";

const ProfileIcon = () => {
  const authContext = useContext(AuthContext);
  const address = authContext.address;
  const slicedAddr = address.slice(0, 6) + "..." + address.slice(-4);

  return (
    <Box p={5}>
      <Stack direction="row">
        <Jazzicon diameter={30} seed={jsNumberForAddress(address)} />
        <Box pt={1}>
          <Text fontSize={{ base: "sm", md: "md" }} as="b">
            {slicedAddr}
          </Text>
        </Box>
        <Box pt={1}>
          <ChevronDownIcon />
        </Box>
      </Stack>
    </Box>
  );
};

export default ProfileIcon;
