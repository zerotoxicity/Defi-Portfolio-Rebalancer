import { Button } from "flowbite-react";
import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../../store/auth-context";

const ProfileIcon = () => {
  const authContext = useContext(AuthContext);
  const [userAddress, setUserAddress] = useState("0x1234...5678");
  const initialLoad = useRef(true);
  const [onLogoutHandler, setOnLogoutHandler] = useState(() => {});

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    // Retrieve logged in user's address
    let addressString = String(authContext.address);
    let userAddr =
      addressString.substring(0, 6) +
      "..." +
      addressString.substring(addressString.length - 4);
    setUserAddress(userAddr);

    setOnLogoutHandler(() => {
      return () => authContext.logout();
    });
  }, [authContext.address]);

  return (
    <div className="flex">
      <Link href="/profile">
        <a className="self-center whitespace-nowrap text-sm dark:text-white pr-2">
          <span>{userAddress}</span>
        </a>
      </Link>
      <Button onClick={onLogoutHandler}>Log out</Button>
    </div>
  );
};

export default ProfileIcon;
