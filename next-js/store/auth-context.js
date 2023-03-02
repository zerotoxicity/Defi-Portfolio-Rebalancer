import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

const AuthContext = React.createContext({
  isLoggedIn: false,
  address: "",
  signer: "",
  provider: "",
  login: () => {},
  logout: () => {},
  switchAccount: () => {},
});

export const AuthContextProvider = (props) => {
  const [address, setAddress] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(!!address);
  const [signer, setSigner] = useState("");
  const [provider, setProvider] = useState("");

  const loginHandler = async () => {
    var accounts = await window.ethereum.request({ method: "eth_accounts" });

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
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    setSigner(provider.getSigner());
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
    signer: signer,
    provider: provider,
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
