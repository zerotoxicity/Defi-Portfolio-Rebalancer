import { Grid, GridItem, Text } from "@chakra-ui/react";

const PoolHeader = () => {
  return (
    <Grid templateColumns="repeat(9,1fr)" p={5}>
      <GridItem colStart={1} pl={10}>
        <Text fontSize="lg" as="b">
          Asset
        </Text>
      </GridItem>
      <GridItem colStart={4} colSpan={3}>
        <Text fontSize="lg" as="b">
          Protocols
        </Text>
      </GridItem>
      <GridItem colStart={7}>
        <Text fontSize="lg" as="b">
          APY
        </Text>
      </GridItem>
    </Grid>
  );
};

export default PoolHeader;
