import { CardBody, Text } from "@chakra-ui/react";
import {
  AssetAddressEnum,
  manageContractAddresses,
} from "components/constants";
import {
  calculateAPY,
  calculateAPYArr,
  convertTo2Decimals,
} from "components/helperFunctions";
import { ethers } from "ethers";
import { ILENDINGPROTOCOL_ABI } from "jsABI/ILendingProtocolCore";
import { useContext, useEffect, useState } from "react";
import AuthContext from "store/auth-context";
import PoolInfo from "./PoolInfo";

const PoolCardBody = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const authContext = useContext(AuthContext);
  const [manageContractsDetails, setManageContractDetails] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const detailsArr = [];

      for (var i = 0; i < manageContractAddresses.contracts.length; i++) {
        var contracts = manageContractAddresses.contracts[i];
        const keyArr = Object.keys(contracts.addr);
        for (var j = 0; j < keyArr.length; j++) {
          const address = keyArr[j];

          const manageContract = new ethers.Contract(
            address,
            ILENDINGPROTOCOL_ABI,
            authContext.signer
          );
          const asset = (await manageContract.getAsset()).toLowerCase();

          const protocolArr = await manageContract.getProtocols();

          const allAPR = await manageContract.getAllAPR();
          const allAPY = calculateAPYArr(allAPR);

          const contractObj = {
            asset: AssetAddressEnum[asset],
            protocolArr: protocolArr,
            apy: allAPY,
            contractAddr: address,
          };
          detailsArr.push(contractObj);
        }
      }
      setIsLoaded(true);
      setManageContractDetails(detailsArr);
    };

    if (authContext.signer) {
      fetchData().catch(console.error);
    }
  }, [authContext.signer]);

  return (
    <CardBody>
      {isLoaded
        ? Object.keys(manageContractsDetails).map((item, index) => {
            return (
              <PoolInfo
                key={index}
                asset={manageContractsDetails[item].asset}
                protocols={manageContractsDetails[item].protocolArr}
                apy={manageContractsDetails[item].apy}
                contractAddr={manageContractsDetails[item].contractAddr}
              />
            );
          })
        : null}
    </CardBody>
  );
};

export default PoolCardBody;
