import { Button, ButtonGroup, Box } from "@chakra-ui/react";
import { useContext } from "react";
import AuthContext from "store/auth-context";

/**
 * Displays a login button that let users connect their MetaMask wallet to the app
 * @component
 */
const LoginButton = () => {
  const authContext = useContext(AuthContext);

  //Invoke login function when user clicks on the button
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
