import { Button } from "flowbite-react";
import { useContext } from "react";
import AuthContext from "../../store/auth-context";

const LoginButton = () => {
  const authContext = useContext(AuthContext);

  const onClickHandler = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        authContext.login();
      } catch (e) {
        console.log(e.message);
      }
    } else {
      console.log("Failed");
    }
  };

  return (
    <>
      <Button onClick={onClickHandler} className="w-max">
        Connect Wallet
      </Button>
    </>
  );
};

export default LoginButton;
