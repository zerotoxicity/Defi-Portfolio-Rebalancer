const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

let lendingPool;
//Get AAVE v2 pool address
async function getLendingPoolContract(account) {
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    networkConfig[network.config.chainId].aLendingPoolProvider,
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
  console.log(symbol + " balance: " + totalCollateralETH);

  console.log("-----\n");
  return totalCollateralETH;
}

module.exports = {
  getLendingPoolContract,
  getAAVEBalance,
};
