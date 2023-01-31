import { CardBody } from "@chakra-ui/react";
import PoolInfo from "./PoolInfo";

const PoolCardBody = () => {
  const protocols = ["AAVE", "COMP"];
  const assetSymbol = "WETH";
  const apy = "0.00";
  return <PoolInfo assetSymbol={assetSymbol} protocols={protocols} apy={apy} />;
};

export default PoolCardBody;
