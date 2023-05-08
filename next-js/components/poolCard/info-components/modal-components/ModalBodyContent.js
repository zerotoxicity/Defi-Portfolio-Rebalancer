import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  ModalBody,
  Select,
  Text,
} from "@chakra-ui/react";
import { rebalancerContractAddresses } from "helper/constants";
import { useState } from "react";
import ModalButtonGroup from "./ModalButtonGroup";

/**
 * Modal component that displays:
 * - text component, for user to enter amount when interacting with the contract
 * - dropdown menu, user can select another Rebalancer contract to transfer funds to
 * - group of buttons that call its respective contract functions when clicked
 * @component
 *
 * @example
 * //Sample usage
 *
 * <ModalBodyContent
 *  initialRef = null
 *  contractAddr = "0xE7FF84Df24A9a252B6E8A5BB093aC52B1d8bEEdf"
 * />
 *
 * @param {*} initialRef True when focus is passed to the modal component
 * @param contractAddr Address of current Rebalancer pool contract
 * @returns
 */
const ModalBodyContent = ({ initialRef, contractAddr }) => {
  let arrWithAddr;
  let asset = "";
  let mantissa = 0;
  const [amount, setAmount] = useState("");
  const [transferAddr, setTransferAddr] = useState("");
  const [validAmt, setValidAmt] = useState(false);
  const [invalidTransfer, setInvalidTransfer] = useState(false);

  //Retrieve asset name and mantissa
  for (var i = 0; i < rebalancerContractAddresses.contracts.length; i++) {
    var contracts = rebalancerContractAddresses.contracts[i];

    const tempArr = Object.entries(contracts.addr);
    for (var j = 0; j < tempArr.length; j++) {
      if (tempArr[j][0] === contractAddr) {
        if (asset === "") {
          asset = contracts.name;
          mantissa = contracts.mantissa;
        }
        arrWithAddr = tempArr;
        break;
      }
    }
  }
  //Remove current pool address from the list of addresses
  const filteredAddr = arrWithAddr.filter(function (x, idx) {
    return arrWithAddr[idx][0] !== contractAddr;
  });

  const changeHandler = (e) => {
    setTransferAddr(e.target.value);
  };

  return (
    <ModalBody pb={6}>
      <Flex flexDir="column" alignItems="stretch" width="100%">
        <FormControl isRequired>
          <FormLabel>Amount </FormLabel>
          <Input
            ref={initialRef}
            type="number"
            placeholder={`Amount (in ${asset})`}
            value={amount}
            onChange={(e) => {
              if (e.target.value <= 0) setValidAmt(false);
              else setValidAmt(true);
              setAmount(e.target.value);
            }}
          />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Transfer asset to:</FormLabel>
          <Select
            placeholder="Only applicable to 'Transfer'"
            value={transferAddr}
            onChange={changeHandler}
          >
            {filteredAddr.map((x, idx) => {
              return (
                //x[0] is the key of the object
                <option key={idx} value={x[0]}>
                  {asset} - {x[1][0]}
                </option>
              );
            })}
          </Select>
        </FormControl>
      </Flex>
      {invalidTransfer && (
        <Text as="b" color="red">
          Please select a transfer pool
        </Text>
      )}
      <ModalButtonGroup
        validAmt={validAmt}
        mantissa={mantissa}
        amount={amount}
        contractAddr={contractAddr}
        transferAddr={transferAddr}
        setInvalidTransfer={setInvalidTransfer}
      />
    </ModalBody>
  );
};

export default ModalBodyContent;
