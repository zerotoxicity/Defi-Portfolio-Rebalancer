import { Box, Flex, Image, Stack, Text } from "@chakra-ui/react";
import ProtocolInfoPopover from "./popover-components/ProtocolInfoPopover";

const PoolInfoProtocol = ({ protocols, apy }) => {
  const maxAPY = Number(Math.max(...apy)).toFixed(2);
  const protocolsLength = protocols.length;

  return (
    <Flex mt={2}>
      {protocolsLength === 1 ? <Box mr={6} /> : null}
      {protocols.map((p, index) => (
        <ProtocolInfoPopover
          key={index}
          protocol={p}
          selected={apy[index] === maxAPY || protocols.length === 1}
          apy={apy[index]}
        />
      ))}
    </Flex>
  );
};

export default PoolInfoProtocol;
