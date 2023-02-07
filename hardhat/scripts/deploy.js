const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { deployContract } = require("../test/helpers/testHelper");

async function main() {
  console.log("⏳ Deploying..");
  await deployManageMultiple();
  await deployManageAave();
  await deployManageComp();
  await deployManageCompWETH();
  console.log("✅ All deployed!");
}

async function deployManageMultiple() {
  wethContractAddress = networkConfig[network.config.chainId].WETHToken;
  cETHContractAddress = networkConfig[network.config.chainId].cETHToken;
  aWethContractAddress = networkConfig[network.config.chainId].aWETHToken;
  poolProviderAddress = networkConfig[network.config.chainId].poolAddrProvider;

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
  wethContractAddress = networkConfig[network.config.chainId].WETHToken;
  aWethContractAddress = networkConfig[network.config.chainId].aWETHToken;
  poolProviderAddress = networkConfig[network.config.chainId].poolAddrProvider;

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

async function deployManageComp() {
  daiTokenAddress = networkConfig[network.config.chainId].DAIToken;
  cDAITokenAddress = networkConfig[network.config.chainId].cDAIToken;

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

async function deployManageCompWETH() {
  wethContractAddress = networkConfig[network.config.chainId].WETHToken;
  cETHContractAddress = networkConfig[network.config.chainId].cETHToken;

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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
