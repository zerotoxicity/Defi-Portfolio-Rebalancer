import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const AuthContext = React.createContext({
  isLoggedIn: false,
  address: "",
  login: () => {},
  logout: () => {},
  switchAccount: () => {},
});

export const AuthContextProvider = (props) => {
  const [address, setAddress] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(!!address);

  const loginHandler = async () => {
    var accounts = await ethereum.request({ method: "eth_accounts" });

    //Not connected
    if (!(accounts && accounts.length > 0)) {
      accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
    }
    //If user does not have address stored in cache
    if (localStorage.getItem("address") === null) {
      localStorage.setItem("address", accounts[0]);
    }
    setAddress(localStorage.getItem("address"));
    setUserLoggedIn(true);
  };

  const logoutHandler = () => {
    setAddress("");
    setUserLoggedIn(false);
    localStorage.removeItem("address");
  };

  const switchAccountHandler = async (account) => {
    localStorage.setItem("address", account);
    setAddress(account);
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
