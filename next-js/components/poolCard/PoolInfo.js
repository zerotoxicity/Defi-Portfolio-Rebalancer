import { Button, Grid, GridItem, Text } from "@chakra-ui/react";
import PoolInfoAsset from "./info-components/PoolInfoAsset";
import PoolInfoManage from "./info-components/PoolInfoManage";
import PoolInfoProtocol from "./info-components/PoolInfoProtocol";

const PoolInfo = ({ assetSymbol, protocols, apy }) => {
  return (
    <Grid templateColumns="repeat(9,1fr)" m={3}>
      <GridItem colStart={1}>
        <PoolInfoAsset assetSymbol={assetSymbol} />
      </GridItem>
      <GridItem colStart={4} colSpan={1}>
        <PoolInfoProtocol protocols={protocols} />
      </GridItem>
      <GridItem colStart={7} mt={5}>
        <Text>{apy}%</Text>
      </GridItem>
      <GridItem colStart={9} mt={3}>
        <PoolInfoManage />
      </GridItem>
    </Grid>
  );
};

export default PoolInfo;
