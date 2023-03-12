const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const {
  deployContract,
  addWETHToAccount,
} = require("../test/helpers/testHelper");

const poolProviderAddress =
  networkConfig[network.config.chainId].poolAddrProvider;

const wethContractAddress = networkConfig[network.config.chainId].WETHToken;
const aWETHContractAddress = networkConfig[network.config.chainId].aWETHToken;
const cETHContractAddress = networkConfig[network.config.chainId].cETHToken;

const daiTokenAddress = networkConfig[network.config.chainId].DAIToken;
const aDAIContractAddress = networkConfig[network.config.chainId].aDAIToken;
const cDAITokenAddress = networkConfig[network.config.chainId].cDAIToken;

const wbtcTokenAddress = networkConfig[network.config.chainId].wBTCToken;
const aBTCContractAddress = networkConfig[network.config.chainId].aWBTCToken;
const cBTCTokenAddress = networkConfig[network.config.chainId].cWBTCToken;

const tokenAddrObj = {
  [wethContractAddress]: [aWETHContractAddress, cETHContractAddress],
  [daiTokenAddress]: [aDAIContractAddress, cDAITokenAddress],
  [wbtcTokenAddress]: [aBTCContractAddress, cBTCTokenAddress],
};

async function main() {
  console.log("⏳ Deploying..");
  //WETH
  await deployManageMultiple("WETH", wethContractAddress, "RMETH", "RME");
  await deployManageAave("WETH", wethContractAddress, "RAETH", "RAE");
  await deployManageCompWETH("WETH", wethContractAddress, "RCETH", "RCE");
  console.log("💰 WETH deployed!\n\n");

  //DAI
  await deployManageMultiple("DAI", daiTokenAddress, "RMDAI", "RMD");
  await deployManageAave("DAI", daiTokenAddress, "RADAI", "RAD");
  await deployManageComp("DAI", daiTokenAddress, "RCDAI", "RCD");
  console.log("🪙 DAI deployed!\n\n");

  await deployManageMultiple("WBTC", wbtcTokenAddress, "RMBTC", "RMB");
  await deployManageAave("WBTC", wbtcTokenAddress, "RABTC", "RAB");
  await deployManageComp("WBTC", wbtcTokenAddress, "RCBTC", "RCB");
  console.log("✅ All deployed!");

  const accounts = await ethers.getSigners();
  await addWETHToAccount(accounts[0], ethers.utils.parseEther("50"));
  console.log(accounts[0].address, " received 50 WETH");
}

//WETH
async function deployManageMultiple(assetName, assetAddr, name, symbol) {
  let aTokenAddr = tokenAddrObj[assetAddr][0];
  let cTokenAddr = tokenAddrObj[assetAddr][1];
  rebalancerTokenContract = await deployContract("RebalancerToken", [
    name,
    symbol,
    cTokenAddr,
    assetAddr,
  ]);
  // console.log("deployed rebalancer");
  //Deploy both lending protocols
  const compContract =
    assetAddr === wethContractAddress ? "ManageCompWETH" : "ManageComp";
  manageComp = await deployContract(compContract, [
    cTokenAddr,
    rebalancerTokenContract.address,
    assetAddr,
  ]);

  manageAave = await deployContract("ManageAave", [
    aTokenAddr,
    rebalancerTokenContract.address,
    poolProviderAddress,
  ]);

  manageProtocolsAddress = [manageComp.address, manageAave.address];

  manageProtocols = [manageAave, manageComp];

  manageMultiple = await deployContract("ManageMultiple", [
    manageProtocolsAddress,
  ]);
  // console.log(
  //   assetName,
  //   "ManageMultiple is deployed to: ",
  //   manageMultiple.address
  // );
  const allProtocols = [...manageProtocols, manageMultiple];
  for (const protocols of allProtocols) {
    await rebalancerTokenContract.setAuthorised(protocols.address, true);
  }

  await rebalancerTokenContract.setManageProtocol(manageMultiple.address);
  console.log(
    assetName,
    "ManageMultiple is deployed to: ",
    manageMultiple.address
  );
  console.log(
    "Rebalancer token is deployed to: ",
    rebalancerTokenContract.address
  );
  console.log("");
}

async function deployManageAave(assetName, assetAddr, name, symbol) {
  let aTokenAddr = tokenAddrObj[assetAddr][0];
  rebalancerTokenContract = await deployContract("RebalancerToken", [
    name,
    symbol,
    aTokenAddr,
    assetAddr,
  ]);

  manageAave = await deployContract("ManageAave", [
    aTokenAddr,
    rebalancerTokenContract.address,
    poolProviderAddress,
  ]);

  await rebalancerTokenContract.setManageProtocol(manageAave.address);
  console.log(assetName, "ManageAave is deployed to: ", manageAave.address);
  console.log(
    "Rebalancer token is deployed to: ",
    rebalancerTokenContract.address
  );
  console.log("");
}

async function deployManageCompWETH(assetName, assetAddr, name, symbol) {
  let cETHContractAddress = tokenAddrObj[assetAddr][1];
  rebalancerTokenContract = await deployContract("RebalancerToken", [
    name,
    symbol,
    cETHContractAddress,
    assetAddr,
  ]);
  manageComp = await deployContract("ManageCompWETH", [
    cETHContractAddress,
    rebalancerTokenContract.address,
    assetAddr,
  ]);

  await rebalancerTokenContract.setManageProtocol(manageComp.address);

  console.log("ManageComp deployed!");
  console.log(assetName, "ManageComp is deployed to: ", manageComp.address);
  console.log(
    "Rebalancer token is deployed to: ",
    rebalancerTokenContract.address
  );
  console.log("");
}

async function deployManageComp(assetName, assetAddr, name, symbol) {
  let cTokenAddr = tokenAddrObj[assetAddr][1];

  rebalancerTokenContract = await deployContract("RebalancerToken", [
    name,
    symbol,
    cTokenAddr,
    assetAddr,
  ]);

  manageComp = await deployContract("ManageComp", [
    cTokenAddr,
    rebalancerTokenContract.address,
    assetAddr,
  ]);

  await rebalancerTokenContract.setManageProtocol(manageComp.address);

  console.log(assetName, "ManageComp is deployed to: ", manageComp.address);
  console.log(
    "Rebalancer token is deployed to: ",
    rebalancerTokenContract.address
  );
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
