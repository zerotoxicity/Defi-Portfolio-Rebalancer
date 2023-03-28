import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";
import ModalBodyContent from "./modal-components/ModalBodyContent";

/**
 * This component is part of the PoolInfo component
 * It displays the "Manage" button that will spawn a modal component
 * @component
 *
 * @example
 * //Sample usage
 *
 * <PoolInfoManage
 *  contractAddr = "0xE7FF84Df24A9a252B6E8A5BB093aC52B1d8bEEdf"
 * />
 *
 * @param {*} contractAddr Address of this Rebalancer pool contract
 */
const PoolInfoManage = ({ contractAddr }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = useRef(null);
  const finalRef = useRef(null);

  return (
    <>
      <Button
        w={{ base: 10, sm: 12, md: 20 }}
        onClick={onOpen}
        {...(isOpen ? { variant: "solid" } : { variant: "outline" })}
        colorScheme="primary"
        ref={finalRef}
      >
        <Text fontSize={{ base: 8, md: 17 }}>Manage</Text>
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage asset</ModalHeader>
          <ModalCloseButton />
          <ModalBodyContent
            initialRef={initialRef}
            contractAddr={contractAddr}
          />
        </ModalContent>
      </Modal>
    </>
  );
};

export default PoolInfoManage;
