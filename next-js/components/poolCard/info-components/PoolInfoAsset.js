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
    <Stack direction="row" flexShrink={0}>
      <Image
        mt={2}
        borderRadius="full"
        boxSize={{ base: 7, sm: 10, md: 12 }}
        src={`icons/${asset}.png`}
        alt={asset}
      />

      <Grid templateRows="repeat(2,1fr)">
        <GridItem rowStart={1} w={{ base: "0%", md: "100%" }}>
          <Text as="b" fontSize={{ base: "0px", md: "lg" }}>
            {/* {assetName === "DAI" && <Box mt={3} />} */}
            {assetName}
          </Text>
        </GridItem>
        <GridItem
          mt={{ base: "3", sm: "3" }}
          rowStart={{ base: "1", sm: "2", md: "2" }}
        >
          <Text
            color={{ base: "black", md: "gray" }}
            fontSize={{ base: "12px", sm: "sm" }}
          >
            {asset}
          </Text>
        </GridItem>
      </Grid>
    </Stack>
  );
};

export default PoolInfoAsset;
