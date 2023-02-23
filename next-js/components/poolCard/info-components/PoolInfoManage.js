import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";
import ModalBodyContent from "./modal-components/ModalBodyContent";

const PoolInfoManage = ({ contractAddr }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = useRef(null);
  const finalRef = useRef(null);

  return (
    <>
      <Button
        onClick={onOpen}
        {...(isOpen ? { variant: "solid" } : { variant: "outline" })}
        colorScheme="primary"
        ref={finalRef}
      >
        Manage
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
