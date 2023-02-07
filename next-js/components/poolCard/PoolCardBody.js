import { manageContractAddresses } from "components/contracts";
import { ethers } from "ethers";
import { ILENDINGPROTOCOL_ABI } from "jsABI/ILendingProtocolCore";
import { useContext, useEffect, useState } from "react";
import AuthContext from "store/auth-context";
import PoolInfo from "./PoolInfo";

const PoolCardBody = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const authContext = useContext(AuthContext);
  const manageContractsDetails = [];
  const protocols = ["AAVE", "COMP"];
  const assetSymbol = ["WETH"];
  const apy = ["0.00"];

  useEffect(() => {
    const fetchData = async () => {
      console.log(authContext.signer);
      for (const address of manageContractAddresses) {
        const manageContract = new ethers.Contract(
          address,
          ILENDINGPROTOCOL_ABI,
          authContext.signer
        );

        console.log("fetching asset");
        const asset = await manageContract.getAsset();

        console.log("fetching protocol");
        const protocolArr = await manageContract.getProtocols();

        const APR = await manageContract.getAPR();
        const contractObj = {
          asset: asset,
          protocolArr: protocolArr,
          APR: APR,
          contractAddr: address,
        };
        manageContractsDetails.push(contractObj);
      }
      setIsLoaded(true);
    };
    if (authContext.signer) {
      fetchData().catch(console.error);
    }
  }, [authContext.signer]);

  return (
    <>
      {isLoaded === true
        ? manageContractsDetails.map((element) => {
            <PoolInfo
              assetSymbol={element.asset}
              protocols={element.protocolArr}
              apy={element.APR}
            />;
          })
        : null}
    </>
  );
};

export default PoolCardBody;
