const { ethers, network } = require("hardhat");
const { networkConfig } = require("../../helper-hardhat-config");

//Get AAVE v2 pool address
async function getLendingPoolContract(account) {
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    networkConfig[network.config.chainId].poolAddrProvider,
    account
  );

  const lendingPoolAddress =
    await lendingPoolAddressesProvider.getLendingPool();

  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
  return lendingPool;
}

async function getAAVEBalance(lendingPoolContract, address) {
  const { totalCollateralETH } = await lendingPoolContract.getUserAccountData(
    address
  );
  console.log("💰 AAVE " + address + " - ");
  console.log(" balance: " + totalCollateralETH);

  console.log("-----\n");
  return totalCollateralETH;
}

async function getAWETHContract(account) {
  const aWETH = await ethers.getContractAt(
    "IAToken",
    networkConfig[network.config.chainId].aWETHToken,
    account
  );
  return aWETH;
}
module.exports = {
  getLendingPoolContract,
  getAAVEBalance,
  getAWETHContract,
};
