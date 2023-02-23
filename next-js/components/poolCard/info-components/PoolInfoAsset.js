import { Grid, GridItem, Image, Stack, Text } from "@chakra-ui/react";
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
    <Stack direction="row">
      <Image
        mt={2}
        borderRadius="full"
        boxSize="50px"
        src={`icons/${asset}.png`}
        alt={asset}
      />

      <Grid templateRows="repeat(2,1fr)">
        <GridItem rowStart={1}>
          <Text as="b" fontSize="lg">
            {assetName}
          </Text>
        </GridItem>
        <GridItem rowStart={2}>
          <Text color="gray">{asset}</Text>
        </GridItem>
      </Grid>
    </Stack>
  );
};

export default PoolInfoAsset;
