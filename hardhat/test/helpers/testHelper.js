const { ethers, network, upgrades } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

//Amount to convert to WETH
const AMOUNT = ethers.utils.parseEther("1");

async function deployContract(contractName, args) {
  const contractFactory = await ethers.getContractFactory(contractName);
  const contract = await upgrades.deployProxy(contractFactory, args, {
    kind: "uups",
  });
  return contract;
}

async function deployRebalancer(pTokenAddr, assetAddr) {
  const rebalancerTokenContractFactory = await ethers.getContractFactory(
    "RebalancerToken"
  );
  return await rebalancerTokenContractFactory.deploy(
    "Rebalancer",
    "Reb",
    pTokenAddr,
    assetAddr
  );
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

async function addDaiToAccount(signer, amount) {
  wethContractAddress = networkConfig[network.config.chainId].WETHToken;
  daiTokenAddress = networkConfig[network.config.chainId].DAIToken;

  routerContract = await getUniswapRouterContract();
  const tx = await routerContract
    .connect(signer)
    .swapExactETHForTokens(
      0,
      [wethContractAddress, daiTokenAddress],
      signer.address,
      1703490033,
      { value: amount }
    );
  await tx.wait(1);
}

async function addWETHToAccount(signer, amount) {
  wethContractAddress = networkConfig[network.config.chainId].WETHToken;

  const iWeth = await ethers.getContractAt(
    "IWETH",
    wethContractAddress,
    signer
  );
  const txResponse = await iWeth.connect(signer).deposit({
    value: amount,
  });
  await txResponse.wait(1);
}

module.exports = {
  AMOUNT,
  deployContract,
  deployRebalancer,
  getWeth,
  getUniswapRouterContract,
  addDaiToAccount,
  addWETHToAccount,
};
