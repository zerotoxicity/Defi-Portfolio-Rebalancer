import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  ModalBody,
  Select,
} from "@chakra-ui/react";
import { manageContractAddresses } from "components/constants";
import { approveToken, rebDeposit } from "components/onChainFunctions";
import { ethers } from "ethers";
import { IERC20_ABI } from "jsABI/IERC20";
import { ILENDINGPROTOCOL_ABI } from "jsABI/ILendingProtocolCore";
import { useContext, useState } from "react";
import AuthContext from "store/auth-context";

const ModalBodyContent = ({ initialRef, contractAddr }) => {
  const authContext = useContext(AuthContext);

  let arrWithAddr;
  const [amount, setAmount] = useState("");
  const [transferAddr, setTransferAddr] = useState("");
  const [asset, setAsset] = useState("");
  const [mantissa, setMantissa] = useState(0);
  const [approved, setApproved] = useState(true);
  const [approvalText, setApprovalText] = useState("Approve funds");
  const [manageContractObj, setManageContractObj] = useState();
  const [assetAddrObj, setAssetAddrObj] = useState();

  if (manageContractObj == null) {
    setManageContractObj(
      new ethers.Contract(
        contractAddr,
        ILENDINGPROTOCOL_ABI,
        authContext.signer
      )
    );
  }

  for (var i = 0; i < manageContractAddresses.contracts.length; i++) {
    var contracts = manageContractAddresses.contracts[i];

    const tempArr = Object.entries(contracts.addr);
    for (var j = 0; j < tempArr.length; j++) {
      if (tempArr[j][0] === contractAddr) {
        if (asset === "") {
          setAsset(contracts.name);
          setMantissa(contracts.mantissa);
        }
        arrWithAddr = tempArr;
        break;
      }
    }
  }

  const filteredAddr = arrWithAddr.filter(function (x, idx) {
    return arrWithAddr[idx][0] !== contractAddr;
  });

  const changeHandler = (e) => {
    setTransferAddr(e.target.value);
  };

  async function depositOnClick() {
    const addr = await manageContractObj.getAsset();
    const tokenContract = new ethers.Contract(
      addr,
      IERC20_ABI,
      authContext.signer
    );
    setAssetAddrObj(tokenContract);
    const allowance = ethers.utils.formatEther(
      await tokenContract.allowance(authContext.address, contractAddr)
    );

    if (allowance < amount) {
      setApproved(false);
    } else {
      await manageContractObj.supply(
        authContext.address,
        ethers.utils.parseEther(amount)
      );
    }
  }

  return (
    <ModalBody pb={6}>
      <Flex flexDir="column" alignItems="stretch" width="100%">
        <FormControl isRequired>
          <FormLabel>Amount </FormLabel>
          <Input
            ref={initialRef}
            placeholder={`Amount (in ${asset})`}
            value={amount}
            onChange={(e) => {
              if (e.target.value <= 0) return;
              setAmount(e.target.value);
            }}
          />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Transfer asset to:</FormLabel>
          <Select
            placeholder="Transfer asset to (Only applicable to 'Manage')"
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

      {/* BUTTON GROUP */}

      <Box mt={10} />
      <Grid templateColumns="repeat(5,1fr)">
        <GridItem>
          <Button isDisabled={!approved}>Withdraw</Button>
        </GridItem>
        <GridItem colStart="3">
          <Button isDisabled={!approved}>Manage</Button>
        </GridItem>
        <GridItem colStart={5} isDisabled={!approved}>
          <Button
            colorScheme="primary"
            onClick={async () => {
              if (amount <= 0) return;
              await depositOnClick();
            }}
          >
            Deposit
          </Button>
        </GridItem>
      </Grid>

      {/* APPROVAL BUTTON */}

      {!approved && (
        <Flex flexDir="column" alignItems="stretch" width="100%">
          <Box mt={10} />
          <Button
            onClick={async () => {
              setApprovalText("Please wait..");
              const val = ethers.utils.parseEther(amount);
              await assetAddrObj.approve(contractAddr, val);
              assetAddrObj.on("Approval", (owner, spender, value) => {
                if (value >= val) setApproved(true);
                setApprovalText("Approve funds");
              });
            }}
          >
            {approvalText}
          </Button>
        </Flex>
      )}
    </ModalBody>
  );
};

export default ModalBodyContent;
