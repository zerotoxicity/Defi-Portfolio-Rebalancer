import { Stack, Text } from "@chakra-ui/react";

const PopoverBodyContent = ({ protocol, selected, apy }) => {
  const selectedStyle = selected ? null : { color: "grey" };

  return (
    <Stack>
      <Text as="b" {...selectedStyle}>
        Protocol details
      </Text>
      <Text {...selectedStyle}>Name: {protocol}</Text>
      <Text {...selectedStyle}>APY: {apy}%</Text>
    </Stack>
  );
};

export default PopoverBodyContent;
