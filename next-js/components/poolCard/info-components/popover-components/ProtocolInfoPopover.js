import {
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import PopoverBodyContent from "./PopoverBodyContent";
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
          boxSize="50px"
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
