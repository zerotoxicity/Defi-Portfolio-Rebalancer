import {
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import PopoverBodyContent from "./PopoverBodyContent";
//TODO selected
const ProtocolInfoPopover = ({ protocol, selected }) => {
  return (
    <Popover placement="top" trigger="hover">
      <PopoverTrigger>
        <Image
          src={`icons/${protocol}.png`}
          {...(selected ? { border: "2px", borderRadius: "full" } : null)}
          boxSize="50px"
          mr={2}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>
          <PopoverBodyContent />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ProtocolInfoPopover;
