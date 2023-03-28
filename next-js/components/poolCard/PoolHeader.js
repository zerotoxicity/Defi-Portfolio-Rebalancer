import { Grid, GridItem, Text } from "@chakra-ui/react";

/**
 * Component containing the header text for the list of pool
 *
 */
const PoolHeader = () => {
  return (
    <Grid templateColumns="repeat(9,1fr)" p={{ base: 0, sm: 5 }}>
      <GridItem colStart={1} pl={{ base: 5, sm: 10 }}>
        <Text fontSize="lg" as="b">
          Asset
        </Text>
      </GridItem>
      <GridItem colStart={{ base: 3, sm: 4 }}>
        <Text ml={{ base: 0, md: 3 }} fontSize="lg" as="b">
          Protocols
        </Text>
      </GridItem>
      <GridItem colStart={{ base: 5, sm: 7 }} ml={{ base: 0, sm: -2 }}>
        <Text fontSize="lg" as="b">
          APY
        </Text>
      </GridItem>
    </Grid>
  );
};

export default PoolHeader;
