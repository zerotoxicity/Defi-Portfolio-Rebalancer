import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const AuthContext = React.createContext({
  isLoggedIn: false,
  address: " ",
  login: () => {},
  logout: () => {},
  switchAccount: () => {},
});

export const AuthContextProvider = (props) => {
  const [address, setAddress] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(!!address);

  const loginHandler = async () => {
    //If the user switches account
    //If user has not logged in
    if (localStorage.getItem("address") === null) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setUserLoggedIn(true);
      setAddress(accounts[0]);
      localStorage.setItem("address", accounts[0]);
    }
    //If localStorage has item
    else {
      setUserLoggedIn(true);
      setAddress(localStorage.getItem("address"));
    }
  };

  const switchAccountHandler = async (account) => {
    localStorage.setItem("address", account);
    setAddress(account);
  };

  const logoutHandler = () => {
    console.log("Logout");
    setAddress("");
    setUserLoggedIn(false);
    localStorage.removeItem("address");
  };

  const contextValue = {
    isLoggedIn: userLoggedIn,
    address: address,
    login: loginHandler,
    logout: logoutHandler,
    switchAccount: switchAccountHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
