import { Heading, Image, Stack, Grid, GridItem } from "@chakra-ui/react";

const Logo = () => {
  return (
    <Stack direction="row">
      <Image
        borderRadius="full"
        boxSize="75px"
        src={"icons/WETH.png"}
        alt="Rebalancer"
      />
      <Grid templateRows="repeat(3,1fr)">
        <GridItem rowStart={2}>
          <Heading size="md">Rebalancer</Heading>
        </GridItem>
      </Grid>
    </Stack>
  );
};

export default Logo;
