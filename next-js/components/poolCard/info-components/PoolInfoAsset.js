import { Box, Grid, GridItem, Image, Stack, Text } from "@chakra-ui/react";
import { TokensEnum } from "components/constants";

const PoolInfoAsset = ({ asset }) => {
  const enumKeys = Object.keys(TokensEnum);
  let assetName = "PLACEHOLDER";
  for (const k of enumKeys) {
    if (k === asset) {
      assetName = TokensEnum[k];
    }
  }

  return (
    <Stack direction="row" flexShrink={0} ml={{ base: -5, sm: 0 }}>
      <Image
        mt={2}
        borderRadius="full"
        boxSize={{ base: 7, sm: 10, md: 12 }}
        src={`icons/${asset}.png`}
        alt={asset}
      />

      <Grid templateRows="repeat(2,1fr)">
        <GridItem rowStart={1} w={{ base: "0%", md: "100%" }} mt={{ md: 1.5 }}>
          <Text as="b" fontSize={{ base: "0px", md: "lg" }}>
            {assetName === "DAI" && <Box mt={4} />}
            {assetName}
          </Text>
        </GridItem>
        <GridItem
          mt={{ base: "4", sm: "0" }}
          rowStart={{ base: "1", sm: "2", md: "2" }}
        >
          <Text
            color={{ base: "black", md: "gray" }}
            fontSize={{ base: "10px", sm: "sm" }}
          >
            {asset}
          </Text>
        </GridItem>
      </Grid>
    </Stack>
  );
};

export default PoolInfoAsset;
