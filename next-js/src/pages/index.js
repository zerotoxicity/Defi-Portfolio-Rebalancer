import { useContext, useEffect } from "react";
import AuthContext from "store/auth-context";
import PoolCard from "components/poolCard/PoolCard";

/** Home component contains all the content, user will see when they access first the webpage
 * Excludes content from header component
 */
export default function Home() {
  return (
    <>
      <PoolCard />
    </>
  );
}
