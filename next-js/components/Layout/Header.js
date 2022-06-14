import { Navbar } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import LoginButton from "./LoginButton";
import ProfileIcon from "./ProfileIcon";
import AuthContext from "../../store/auth-context";

const Header = () => {
  const router = useRouter();
  const currentRoute = router.pathname;
  const authContext = useContext(AuthContext);
  const active = "underline decoration-2 decoration-solid";

  useEffect(() => {
    if (localStorage.getItem("address") !== null) {
      authContext.login();
    }
  }, []);
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
      <div className="order-2 ">{profileButton}</div>
      <div className="flex space-x-10">
        <Link href="/">
          <a className={currentRoute === "/" ? active : ""}>Loan</a>
        </Link>
        <Link href="/placeholder">
          <a className={currentRoute === "/placeholder" ? active : ""}>Dex</a>
        </Link>
      </div>
    </Navbar>
  );
};

export default Header;
