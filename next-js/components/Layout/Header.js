import { Navbar } from "flowbite-react";
import Link from "next/link";
import { useContext } from "react";
import LoginButton from "./LoginButton";
import ProfileIcon from "./ProfileIcon";
import AuthContext from "../../store/auth-context";

const Header = () => {
  const authContext = useContext(AuthContext);

  var profileButton = authContext.isLoggedIn ? (
    <ProfileIcon />
  ) : (
    <LoginButton />
  );
  return (
    <Navbar fluid={true} rounded={true}>
      <Navbar.Brand href="https://flowbite.com/">
        <img
          src="https://flowbite.com/docs/images/logo.svg"
          className="mr-3 h-6 sm:h-9"
          alt="Flowbite Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Flowbite
        </span>
      </Navbar.Brand>
      <div className="order-2 max-w-md">{profileButton}</div>
      <Navbar.Collapse className="absolute">
        <Link href="/">Loan</Link>
        <Link href="/placeholder">Dex</Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
