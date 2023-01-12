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

async function getAWETHContract() {
  accounts = await ethers.getSigners();
  const aWETH = await ethers.getContractAt(
    "IAToken",
    networkConfig[network.config.chainId].aWETHToken,
    accounts[0]
  );
  return aWETH;
}
module.exports = {
  getLendingPoolContract,
  getAWETHContract,
};
