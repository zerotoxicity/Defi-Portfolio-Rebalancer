import {
  Box,
  Button,
  ButtonGroup,
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
import { ethers } from "ethers";
import { IERC20_ABI } from "jsABI/IERC20";
import { ILENDINGPROTOCOL_ABI } from "jsABI/ILendingProtocolCore";
import { useContext, useState } from "react";
import AuthContext from "store/auth-context";

const ModalBodyContent = ({ initialRef, contractAddr }) => {
  const authContext = useContext(AuthContext);

  let arrWithAddr;
  let asset = "";
  let mantissa = 0;
  const [amount, setAmount] = useState("");
  const [transferAddr, setTransferAddr] = useState("");
  const [validAmt, setValidAmt] = useState(false);
  const [approved, setApproved] = useState(true);
  const [approveButtonClickable, setApproveButtonClickable] = useState(true);
  const [approvalText, setApprovalText] = useState("Approve funds");
  const [manageContractObj, setManageContractObj] = useState();
  const [tokenContract, setTokenContract] = useState();

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
          asset = contracts.name;
          mantissa = contracts.mantissa;
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

  async function allowanceCheck(tokenAddr) {
    const tokenContract = new ethers.Contract(
      tokenAddr,
      IERC20_ABI,
      authContext.signer
    );
    setTokenContract(tokenContract);
    const allowance = ethers.utils.formatUnits(
      await tokenContract.allowance(authContext.address, contractAddr),
      mantissa
    );

    return (
      parseFloat(parseFloat(allowance).toFixed(2)) <
      parseFloat(parseFloat(amount).toFixed(2))
    );
  }

  async function depositHandler() {
    const addr = await manageContractObj.getAsset();

    if (await allowanceCheck(addr)) {
      setApproved(false);
    } else {
      await manageContractObj.supply(
        authContext.address,
        ethers.utils.parseUnits(amount, mantissa),
        { gasLimit: 2000000 }
      );
    }
  }

  async function withdrawHandler() {
    const addr = await manageContractObj.getRebalancerTokenAddress();

    if (await allowanceCheck(addr)) {
      setApproved(false);
    } else {
      await manageContractObj.withdraw(
        authContext.address,
        ethers.utils.parseUnits(amount, mantissa),
        { gasLimit: 2000000 }
      );
    }
  }

  async function transferHandler() {
    if (!transferAddr) return;
    const addr = await manageContractObj.getRebalancerTokenAddress();

    if (await allowanceCheck(addr)) {
      setApproved(false);
    } else {
      await manageContractObj.moveToAnotherRebalancer(
        transferAddr,
        ethers.utils.parseUnits(amount, mantissa),
        { gasLimit: 2000000 }
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

      {/* BUTTON GROUP */}

      <Box mt={10} />
      <ButtonGroup
        isDisabled={!approved || !validAmt}
        size={{ base: "sm", sm: "md" }}
      >
        <Grid templateColumns="repeat(5,1fr)">
          <GridItem colStart={1}>
            <Button
              onClick={async () => {
                await withdrawHandler();
              }}
            >
              Withdraw
            </Button>
          </GridItem>

          <GridItem colStart={3}>
            <Button
              onClick={async () => {
                await transferHandler();
              }}
            >
              Transfer
            </Button>
          </GridItem>

          <GridItem colStart={5}>
            <Button
              colorScheme="primary"
              onClick={async () => {
                await depositHandler();
              }}
            >
              Deposit
            </Button>
          </GridItem>
        </Grid>
      </ButtonGroup>

      {/* APPROVAL BUTTON */}

      {!approved && (
        <Flex flexDir="column" alignItems="stretch" width="100%">
          <Box mt={10} />
          <Button
            isDisabled={!approveButtonClickable}
            onClick={async () => {
              setApprovalText("Please wait..");
              setApproveButtonClickable(false);
              const amt = ethers.utils.parseEther(amount);
              try {
                await tokenContract.approve(contractAddr, amt);
                tokenContract.on("Approval", (owner, spender, value) => {
                  if (value >= amt) setApproved(true);
                  setApprovalText("Approve funds");
                  setApproveButtonClickable(true);
                });
              } catch (e) {
                setApprovalText("Approve funds");
                setApproveButtonClickable(true);
              }
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
