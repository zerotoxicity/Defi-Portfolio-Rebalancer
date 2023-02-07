import { Box, Flex, Image, Stack } from "@chakra-ui/react";
import ProtocolInfoPopover from "./popover-components/ProtocolInfoPopover";

const PoolInfoProtocol = ({ protocols }) => {
  const protocolsLength = protocols.length;

  return (
    <Flex mt={2}>
      {protocolsLength === 1 ? <Box mr={4} /> : null}
      {protocols.map((p) => (
        <ProtocolInfoPopover protocol={p} selected={true} />
      ))}
    </Flex>
  );
};

export default PoolInfoProtocol;
