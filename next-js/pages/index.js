import { useContext, useEffect } from "react";
import AuthContext from "../store/auth-context";
import AssetCardPanel from "../components/AssetCardPanel";

export default function Home() {
  const authContext = useContext(AuthContext);

  const accountsChangedHandler = async (accounts) => {
    if (accounts.length === 0) {
      authContext.logout();
    } else if (accounts[0] !== authContext.address) {
      authContext.switchAccount(accounts[0]);
    }
  };

  useEffect(() => {
    //Listen to MetaMask event
    ethereum.on("accountsChanged", accountsChangedHandler);
    return () => {
      ethereum.removeListener("accountsChanged", accountsChangedHandler);
    };
  }, []);

  return (
    <>
      <AssetCardPanel />
    </>
  );
}
