import { Grid, GridItem, Image, Stack, Text } from "@chakra-ui/react";
import { TokensEnum } from "components/enums";

const PoolInfoAsset = ({ assetSymbol }) => {
  const enumKeys = Object.keys(TokensEnum);
  let assetName = "PLACEHOLDER";
  for (const k of enumKeys) {
    if (k === assetSymbol) {
      assetName = TokensEnum[k];
    }
  }

  return (
    <Stack direction="row">
      <Image
        mt={2}
        borderRadius="full"
        boxSize="50px"
        src={`icons/${assetSymbol}.png`}
        alt={assetSymbol}
      />

      <Grid templateRows="repeat(2,1fr)">
        <GridItem rowStart={1}>
          <Text as="b" fontSize="lg">
            {assetName}
          </Text>
        </GridItem>
        <GridItem rowStart={2}>
          <Text color="gray">{assetSymbol}</Text>
        </GridItem>
      </Grid>
    </Stack>
  );
};

export default PoolInfoAsset;
