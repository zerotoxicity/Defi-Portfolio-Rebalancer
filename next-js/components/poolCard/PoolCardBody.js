import { Box, CardBody, Skeleton } from "@chakra-ui/react";
import {
  AssetAddressEnum,
  rebalancerContractAddresses,
} from "helper/constants";
import { calculateAPY, calculateAPYArr } from "helper/helperFunctions";
import { ethers } from "ethers";
import { ILENDINGPROTOCOL_ABI } from "jsABI/ILendingProtocolCore";
import { useContext, useEffect, useState } from "react";
import AuthContext from "store/auth-context";
import PoolInfo from "./PoolInfo";

/**
 * Card body component displays all of the pool
 * It will display a skeleton component when the contracts are not fully loaded or user has not signed in
 */
const PoolCardBody = () => {
  const authContext = useContext(AuthContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const [manageContractsDetails, setManageContractDetails] = useState([]);

  /**Retrieves all Rebalancer contracts on render
   * Re-render everytime if the signer is changed
   */
  useEffect(() => {
    const fetchData = async () => {
      const detailsArr = [];

      //Read all contract addresses and get all instances of Rebalancer contracts
      for (var i = 0; i < rebalancerContractAddresses.contracts.length; i++) {
        var contracts = rebalancerContractAddresses.contracts[i];
        const keyArr = Object.keys(contracts.addr);
        for (var j = 0; j < keyArr.length; j++) {
          const address = keyArr[j];
          const manageContract = new ethers.Contract(
            address,
            ILENDINGPROTOCOL_ABI,
            authContext.signer
          );

          //Get information from the contract
          const asset = (await manageContract.getAsset()).toLowerCase();
          const selectedAPR = await manageContract.getAPR();
          const selectedAPY = calculateAPY(
            ethers.utils.formatUnits(selectedAPR, 18)
          );
          const protocolArr = await manageContract.getProtocols();
          const allAPR = await manageContract.getAllAPR();
          const allAPY = calculateAPYArr(allAPR);

          //Add the information to an contract object
          const contractObj = {
            asset: AssetAddressEnum[asset],
            protocolArr: protocolArr,
            apy: allAPY,
            contractAddr: address,
            selectedAPY: selectedAPY,
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
    <CardBody mb={3} mt={{ base: -3, sm: -5 }}>
      {(!isLoaded || !authContext.address) && <Skeleton h={10} />}
      {isLoaded && authContext.address
        ? Object.keys(manageContractsDetails).map((item, index) => {
            return (
              <PoolInfo
                key={index}
                asset={manageContractsDetails[item].asset}
                protocols={manageContractsDetails[item].protocolArr}
                apy={manageContractsDetails[item].apy}
                contractAddr={manageContractsDetails[item].contractAddr}
                selectedAPY={manageContractsDetails[item].selectedAPY}
              />
            );
          })
        : null}
    </CardBody>
  );
};

export default PoolCardBody;
