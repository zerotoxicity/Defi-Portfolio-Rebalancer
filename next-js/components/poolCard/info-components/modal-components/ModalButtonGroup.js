import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { IERC20_ABI } from "jsABI/IERC20";
import { ILENDINGPROTOCOL_ABI } from "jsABI/ILendingProtocolCore";
import { useContext, useState } from "react";
import AuthContext from "store/auth-context";

/**
 * Displays buttons - Deposit, Transfer, Withdraw, and Approve
 * Each button performs a transaction according to its name
 * @component
 *
 * @example
 * //Sample usage
 *
 * <ModalButtonGroup
 *  validAmt = True
 *  amount = 0.1
 *  mantissa = 18
 *  transferAddr = "0x92A00fc48Ad3dD4A8b5266a8F467a52Ac784fC83"
 * />
 *
 * @param {*} validAmt True if amount is greater than 0
 * @param {*} amount user wish to interact with
 * @param {*} mantissa mantissa of the rToken tied to this pool
 * @param {*} transferAddr Address of another Rebalancer pool contract for fund transfer (Optional)
 */
const ModalButtonGroup = ({
  validAmt,
  amount,
  mantissa,
  contractAddr,
  transferAddr = "",
  setInvalidTransfer,
}) => {
  const [approvalText, setApprovalText] = useState("Approve funds");
  const [approved, setApproved] = useState(true);
  const [tokenContract, setTokenContract] = useState();
  const [approveButtonClickable, setApproveButtonClickable] = useState(true);
  const [manageContractObj, setManageContractObj] = useState();
  const authContext = useContext(AuthContext);

  //Retrieve an instance of the rebalancer pool contract if it is null
  if (manageContractObj == null) {
    setManageContractObj(
      new ethers.Contract(
        contractAddr,
        ILENDINGPROTOCOL_ABI,
        authContext.signer
      )
    );
  }

  //Check if user has approved the Rebalancer
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

  //Deposit function
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

  //Withdraw function
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

  //Transfer function
  async function transferHandler() {
    if (!transferAddr) {
      setInvalidTransfer(true);
      return;
    }
    const addr = await manageContractObj.getRebalancerTokenAddress();
    setInvalidTransfer(false);
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
    <>
      {/* BUTTON GROUP
       * Disabled when user has not input a valid amount
       */}

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
              setInvalidTransfer(false);
              const amt = ethers.utils.parseUnits(amount, mantissa);
              try {
                await tokenContract.approve(contractAddr, amt);
                tokenContract.on("Approval", (owner, spender, value) => {
                  if (value >= amt) setApproved(true);
                  setApproved(true);
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
    </>
  );
};

export default ModalButtonGroup;
