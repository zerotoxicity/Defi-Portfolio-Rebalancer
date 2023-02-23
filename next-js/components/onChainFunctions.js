import { ethers } from "ethers";
import { IERC20_ABI } from "jsABI/IERC20";
import { ILENDINGPROTOCOL_ABI } from "jsABI/ILendingProtocolCore";

export async function rebWithdraw(
  manageContractAddr,
  signer,
  userAddr,
  amount
) {
  const manageContract = new ethers.Contract(
    manageContractAddr,
    ILENDINGPROTOCOL_ABI,
    signer
  );
  await manageContract.withdraw(userAddr, amount);
}

export async function rebTransfer(
  manageContractAddr,
  signer,
  transferAddr,
  amount
) {
  const manageContract = new ethers.Contract(
    manageContractAddr,
    ILENDINGPROTOCOL_ABI,
    signer
  );
  await manageContract.moveToAnotherRebalancer(transferAddr, amount);
}
