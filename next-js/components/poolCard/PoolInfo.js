import { Button, Grid, GridItem, Text } from "@chakra-ui/react";
import PoolInfoAsset from "./info-components/PoolInfoAsset";
import PoolInfoManage from "./info-components/PoolInfoManage";
import PoolInfoProtocol from "./info-components/PoolInfoProtocol";

/**
 * A component that displays the content of a pool
 * @component
 *
 * @example
 * //Sample Usage
 *
 * <PoolInfo
 *  asset="0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
 *  protocols = ["Aave","Comp"]
 *  apy = 0.05
 *  contractAddr = "0xE7FF84Df24A9a252B6E8A5BB093aC52B1d8bEEdf"
 * />
 *
 * @param asset address of underlying asset
 * @param protocols list of protocol names,that are being utilized in this pool
 * @param apy highest APY from the group of protocols
 * @param contractAddr address of the Rebalancer
 *
 */
const PoolInfo = ({ asset, protocols, apy, contractAddr, selectedAPY }) => {
  const maxAPY = Number(Math.max(...apy)).toFixed(2);
  return (
    <Grid templateColumns="repeat(9,1fr)" mt={{ base: 3, sm: 2 }}>
      <GridItem colStart={1}>
        <PoolInfoAsset asset={asset} />
      </GridItem>
      <GridItem colStart={{ base: 4, sm: 4 }}>
        <PoolInfoProtocol
          protocols={protocols}
          apy={apy}
          selectedAPY={selectedAPY}
        />
      </GridItem>
      <GridItem colStart={{ base: 7, sm: 7 }} mt={{ base: 3, sm: 5 }}>
        <Text fontSize={{ base: 12, sm: 15 }}>{selectedAPY}%</Text>
      </GridItem>
      <GridItem colStart={9} mt={{ base: 1, sm: 3 }} mr={{ base: -4, sm: 0 }}>
        <PoolInfoManage contractAddr={contractAddr} />
      </GridItem>
    </Grid>
  );
};

export default PoolInfo;
