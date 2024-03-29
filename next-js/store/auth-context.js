import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

/**
 * Context store, used to persist data
 */
const AuthContext = React.createContext({
  isLoggedIn: false,
  address: "",
  signer: "",
  provider: "",
  login: () => {},
  logout: () => {},
  // switchAccount: () => {},
});

export const AuthContextProvider = (props) => {
  const [address, setAddress] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(!!address);
  const [signer, setSigner] = useState("");
  const [provider, setProvider] = useState("");

  //Login function
  const loginHandler = async () => {
    const provider = await detectEthereumProvider();

    var accounts = await provider.request({ method: "eth_accounts" });

    //Not connected
    if (!(accounts && accounts.length > 0)) {
      accounts = await provider.request({
        method: "eth_requestAccounts",
      });
    }
    //If user does not have address stored in browser cache
    if (localStorage.getItem("address") === null) {
      localStorage.setItem("address", accounts[0]);
    }
    setAddress(localStorage.getItem("address"));
    setUserLoggedIn(true);
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    setProvider(ethersProvider);
    setSigner(ethersProvider.getSigner());
  };

  //Logout function
  const logoutHandler = () => {
    setAddress("");
    setUserLoggedIn(false);
    localStorage.removeItem("address");
  };

  //
  // const switchAccountHandler = async (account) => {
  //   localStorage.setItem("address", account);
  //   setAddress(account);
  // };

  const contextValue = {
    isLoggedIn: userLoggedIn,
    address: address,
    signer: signer,
    provider: provider,
    login: loginHandler,
    logout: logoutHandler,
    // switchAccount: switchAccountHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
