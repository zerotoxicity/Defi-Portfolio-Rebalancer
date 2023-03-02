import { Heading, Image, Stack, Grid, GridItem, Text } from "@chakra-ui/react";

const Logo = () => {
  return (
    <Stack direction="row">
      <Image
        borderRadius="full"
        mt={3}
        boxSize={{ base: 10, md: "50px" }}
        src={"icons/WETH.png"}
        alt="Rebalancer"
      />
      <Grid templateRows="repeat(3,1fr)">
        <GridItem rowStart={2}>
          <Text as="b" fontSize={{ base: 0, sm: "md" }}>
            Rebalancer
          </Text>
        </GridItem>
      </Grid>
    </Stack>
  );
};

export default Logo;
