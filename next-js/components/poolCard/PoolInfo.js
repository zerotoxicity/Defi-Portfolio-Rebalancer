import { Button, Grid, GridItem, Text } from "@chakra-ui/react";
import { convertTo2Decimals } from "components/helperFunctions";
import PoolInfoAsset from "./info-components/PoolInfoAsset";
import PoolInfoManage from "./info-components/PoolInfoManage";
import PoolInfoProtocol from "./info-components/PoolInfoProtocol";

const PoolInfo = ({ asset, protocols, apy, contractAddr }) => {
  const maxAPY = Number(Math.max(...apy)).toFixed(2);
  return (
    <Grid templateColumns="repeat(9,1fr)" m={3}>
      <GridItem colStart={1}>
        <PoolInfoAsset asset={asset} />
      </GridItem>
      <GridItem colStart={4} colSpan={1}>
        <PoolInfoProtocol protocols={protocols} apy={apy} />
      </GridItem>
      <GridItem colStart={7} mt={5}>
        <Text>{maxAPY}%</Text>
      </GridItem>
      <GridItem colStart={9} mt={3}>
        <PoolInfoManage contractAddr={contractAddr} />
      </GridItem>
    </Grid>
  );
};

export default PoolInfo;
