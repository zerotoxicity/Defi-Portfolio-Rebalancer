const { ethers, network } = require("hardhat");
const { networkConfig } = require("../../helper-hardhat-config");

const DEPOSIT_AMOUNT = BigInt(100);

//Amount to convert to WETH
const AMOUNT = ethers.utils.parseEther("1");

async function deployRebalancer(pTokenAddr, assetAddr) {
  const rebalancerTokenContractFactory = await ethers.getContractFactory(
    "RebalancerToken"
  );
  rebalancerTokenContract = await rebalancerTokenContractFactory.deploy(
    "Rebalancer",
    "Reb",
    pTokenAddr,
    assetAddr
  );
  return rebalancerTokenContract;
}

async function getUniswapRouterContract() {
  accounts = await ethers.getSigners();
  const router = await ethers.getContractAt(
    "UniswapV2Router02",
    networkConfig[network.config.chainId].uniswapRouter,
    accounts[0]
  );
  return router;
}

//Receive WETH
async function getWeth() {
  accounts = await ethers.getSigners();
  const iWeth = await ethers.getContractAt(
    "IWETH",
    networkConfig[network.config.chainId].WETHToken,
    accounts[0]
  );
  const txResponse = await iWeth.deposit({
    value: ethers.utils.parseEther("2"),
  });
  await txResponse.wait(1);
  return iWeth;
}

//Get balance of the ERC20 token
//currently hardcoded WETH
async function getBalance(erc20Contract, account, symbol) {
  const balance = await erc20Contract.balanceOf(account);
  console.log("💰 " + account + " -");
  console.log(` ${symbol} balance: ${balance} `);
  console.log(
    ` ${symbol} balance: ${ethers.utils.formatEther(balance).toString()} `
  );

  console.log("-----\n");
  return balance;
}

module.exports = {
  AMOUNT,
  deployRebalancer,
  getWeth,
  getBalance,
  getUniswapRouterContract,
};
