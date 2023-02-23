const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { deployContract } = require("../test/helpers/testHelper");

const wethContractAddress = networkConfig[network.config.chainId].WETHToken;
const cETHContractAddress = networkConfig[network.config.chainId].cETHToken;
const aWethContractAddress = networkConfig[network.config.chainId].aWETHToken;
const poolProviderAddress =
  networkConfig[network.config.chainId].poolAddrProvider;
const daiTokenAddress = networkConfig[network.config.chainId].DAIToken;
const cDAITokenAddress = networkConfig[network.config.chainId].cDAIToken;

async function main() {
  console.log("⏳ Deploying..");
  //WETH
  // await deployManageMultiple();
  // await deployManageAave();
  // await deployManageCompWETH();

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();
  console.log("Deployed");

  //DAI
  // await deployManageComp();
  console.log("✅ All deployed!");
}

//WETH
async function deployManageMultiple() {
  rebalancerTokenContract = await deployContract("RebalancerToken", [
    "RCompETH",
    "RCETH",
    cETHContractAddress,
    wethContractAddress,
  ]);

  //Deploy both lending protocols
  manageComp = await deployContract("ManageCompWETH", [
    cETHContractAddress,
    rebalancerTokenContract.address,
    wethContractAddress,
  ]);
  manageAave = await deployContract("ManageAave", [
    aWethContractAddress,
    rebalancerTokenContract.address,
    poolProviderAddress,
  ]);

  manageProtocolsAddress = [manageComp.address, manageAave.address];

  manageProtocols = [manageAave, manageComp];

  manageMultiple = await deployContract("ManageMultiple", [
    manageProtocolsAddress,
  ]);

  const allProtocols = [...manageProtocols, manageMultiple];
  for (const protocols of allProtocols) {
    await rebalancerTokenContract.setAuthorised(protocols.address, true);
  }

  await rebalancerTokenContract.setManageProtocol(manageMultiple.address);
  console.log("ManageMultiple deployed!");
  console.log("WETH ManageMultiple is deployed to: ", manageMultiple.address);
  console.log(
    "Rebalancer token is deployed to: ",
    rebalancerTokenContract.address
  );
  console.log("");
}

async function deployManageAave() {
  rebalancerTokenContract = await deployContract("RebalancerToken", [
    "RAaveWETH",
    "RAWETH",
    aWethContractAddress,
    wethContractAddress,
  ]);

  manageAave = await deployContract("ManageAave", [
    aWethContractAddress,
    rebalancerTokenContract.address,
    poolProviderAddress,
  ]);

  await rebalancerTokenContract.setManageProtocol(manageAave.address);
  console.log("ManageAave deployed!");
  console.log("WETH ManageAave is deployed to: ", manageAave.address);
  console.log(
    "Rebalancer token is deployed to: ",
    rebalancerTokenContract.address
  );
  console.log("");
}

async function deployManageCompWETH() {
  rebalancerTokenContract = await deployContract("RebalancerToken", [
    "RCompETH",
    "RCETH",
    cETHContractAddress,
    wethContractAddress,
  ]);
  manageComp = await deployContract("ManageCompWETH", [
    cETHContractAddress,
    rebalancerTokenContract.address,
    wethContractAddress,
  ]);

  await rebalancerTokenContract.setManageProtocol(manageComp.address);

  console.log("ManageComp deployed!");
  console.log("WETH ManageComp is deployed to: ", manageComp.address);
  console.log(
    "Rebalancer token is deployed to: ",
    rebalancerTokenContract.address
  );
  console.log("");
}

async function deployManageComp() {
  rebalancerTokenContract = await deployContract("RebalancerToken", [
    "RCompDAI",
    "RCDAI",
    cDAITokenAddress,
    daiTokenAddress,
  ]);

  manageComp = await deployContract("ManageComp", [
    cDAITokenAddress,
    rebalancerTokenContract.address,
    daiTokenAddress,
  ]);

  await rebalancerTokenContract.setManageProtocol(manageComp.address);

  console.log("ManageComp deployed!");
  console.log("DAI ManageComp is deployed to: ", manageComp.address);
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
