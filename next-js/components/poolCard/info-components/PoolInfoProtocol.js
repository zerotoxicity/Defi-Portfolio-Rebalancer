import { Box, Flex } from "@chakra-ui/react";
import ProtocolInfoPopover from "./popover-components/ProtocolInfoPopover";

/**
 * This component is part of the PoolInfo component
 * It displays the logo and details of protocols leverage in this pool
 * @component
 *
 * @example
 * //Sample usage
 *
 * <PoolInfoProtocol
 *  protocols = ["Aave"]
 *  apy = 1.03
 * />
 *
 * @param {*} protocols list of protocol names,that are being utilized in this pool
 * @param {*} apy highest APY in this pool
 */
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
