import AuthContext from "../store/auth-context";
import { useContext, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import styles from "../styles/Home.module.css";

export default function Home() {
  const authContext = useContext(AuthContext);

  const accountsChangedHandler = async (accounts) => {
    if (accounts.length === 0) {
      authContext.logout();
    } else if (accounts[0] !== authContext.address) {
      authContext.login(accounts[0]);
    }
  };

  useEffect(() => {
    ethereum.on("accountsChanged", accountsChangedHandler);
    return () => {
      ethereum.removeListener("accountsChanged", accountsChangedHandler);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Layout>hi</Layout>
    </div>
  );
}
