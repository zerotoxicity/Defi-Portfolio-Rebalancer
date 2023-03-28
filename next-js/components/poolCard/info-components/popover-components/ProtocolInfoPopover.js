import {
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import PopoverBodyContent from "./PopoverBodyContent";

/**
 * Displays the protocol logo that shows a popover component when hovering on top of the logo
 * @component
 *
 * @example
 * //Sample usage
 *
 * <ProtocolInfoPopover
 *  protocol = "Aave"
 *  selected = True
 *  apy = 1.02
 * />
 *
 * @param {*} protocol Name of the protocol
 * @param {*} selected True if protocol is the protocol that yield is currently being farmed on
 * @param {*} apy APY of protocol
 */
const ProtocolInfoPopover = ({ protocol, selected, apy }) => {
  const selectedImgStyle = selected
    ? { border: "4px", borderRadius: "full", borderColor: "primary.500" }
    : null;

  return (
    <Popover placement="top" trigger="hover">
      <PopoverTrigger>
        <Image
          src={`icons/${protocol}.png`}
          {...selectedImgStyle}
          boxSize={{ base: 7, sm: 10, md: 12 }}
          mr={2}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>
          <PopoverBodyContent
            protocol={protocol}
            selected={selected}
            apy={apy}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ProtocolInfoPopover;
