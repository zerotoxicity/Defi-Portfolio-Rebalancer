import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const AuthContext = React.createContext({
  isLoggedIn: false,
  address: " ",
  login: () => {},
  logout: () => {},
});

export const AuthContextProvider = (props) => {
  const [address, setAddress] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(!!address);

  const loginHandler = async (account = "") => {
    if (address === "") {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setUserLoggedIn(true);
      setAddress(accounts[0]);
    } else if (account !== address) {
      setAddress(address);
    }
  };

  const logoutHandler = () => {
    console.log("Logout");
    setAddress("");
    setUserLoggedIn(!!address);
  };

  const contextValue = {
    isLoggedIn: userLoggedIn,
    address: address,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
