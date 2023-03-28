import { Stack, Text } from "@chakra-ui/react";

/**
 * PopoverBody component displays two text components, protocol's name and its apy
 * The text will be greyed out if this protocol is not selected
 * @component
 *
 * @example
 * //Sample usage
 *
 * <PopoverBodyContent
 *  protocol = "Aave"
 *  selected = True
 *  apy = 1.02
 * />
 *
 * @param {*} protocol Name of the protocol
 * @param {*} selected True if protocol is the protocol that yield is currently being farmed on
 * @param {*} apy APY of protocol
 * @returns
 */
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
