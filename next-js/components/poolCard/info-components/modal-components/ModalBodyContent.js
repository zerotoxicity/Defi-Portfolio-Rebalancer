import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Menu,
  MenuButton,
  ModalBody,
  Select,
} from "@chakra-ui/react";

const ModalBodyContent = ({ initialRef }) => {
  return (
    <ModalBody pb={6}>
      <Flex flexDir="column" alignItems="stretch" width="100%">
        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <Input ref={initialRef} placeholder="Amount" />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Transfer asset to:</FormLabel>
          <Select placeholder="Transfer asset to">
            <option value="option1">Test</option>
            <option value="option2">Test2</option>
          </Select>
        </FormControl>
      </Flex>
      <Box mt={20} />
      <Grid templateColumns="repeat(5,1fr)">
        <GridItem>
          <Button>Withdraw</Button>
        </GridItem>
        <GridItem colStart="3">
          <Button>Manage</Button>
        </GridItem>
        <GridItem colStart={5}>
          <Button colorScheme="primary">Deposit</Button>
        </GridItem>
      </Grid>
    </ModalBody>
  );
};

export default ModalBodyContent;
