import { Button, Grid, GridItem, Text } from "@chakra-ui/react";
import PoolInfoAsset from "./info-components/PoolInfoAsset";
import PoolInfoManage from "./info-components/PoolInfoManage";
import PoolInfoProtocol from "./info-components/PoolInfoProtocol";

const PoolInfo = ({ asset, protocols, apy, contractAddr }) => {
  const maxAPY = Number(Math.max(...apy)).toFixed(2);
  return (
    <Grid templateColumns="repeat(9,1fr)" mt={{ base: 3, sm: 2 }}>
      <GridItem colStart={1}>
        <PoolInfoAsset asset={asset} />
      </GridItem>
      <GridItem colStart={{ base: 4, sm: 4 }}>
        <PoolInfoProtocol protocols={protocols} apy={apy} />
      </GridItem>
      <GridItem colStart={{ base: 7, sm: 7 }} mt={{ base: 3, sm: 5 }}>
        <Text fontSize={{ base: 12, sm: 15 }}>{maxAPY}%</Text>
      </GridItem>
      <GridItem colStart={9} mt={{ base: 1, sm: 3 }} mr={{ base: -4, sm: 0 }}>
        <PoolInfoManage contractAddr={contractAddr} />
      </GridItem>
    </Grid>
  );
};

export default PoolInfo;
