import { Button, ButtonGroup, Box } from "@chakra-ui/react";
import { useContext } from "react";
import AuthContext from "store/auth-context";

// Login button that is on the navbar
const LoginButton = () => {
  const authContext = useContext(AuthContext);

  const onClickHandler = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await authContext.login();
      } catch (e) {
        console.log(e.message);
      }
    } else {
      console.log("Failed");
    }
  };
  return (
    <Box m={3}>
      <Button colorScheme="primary" onClick={onClickHandler}>
        Log In
      </Button>
    </Box>
  );
};

export default LoginButton;
