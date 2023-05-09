const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { deployContract } = require("../test/helpers/testHelper");
const fs = require("fs");

//Address of Aave pool address provider
const poolProviderAddress =
  networkConfig[network.config.chainId].poolAddrProvider;

//Retrieves address of ERC20 token based on current network
const wethTokenAddress = networkConfig[network.config.chainId].WETHToken;
const aWETHContractAddress = networkConfig[network.config.chainId].aWETHToken; //Aave token
const cETHContractAddress = networkConfig[network.config.chainId].cETHToken; //Compound token

const daiTokenAddress = networkConfig[network.config.chainId].DAIToken;
const aDAIContractAddress = networkConfig[network.config.chainId].aDAIToken; //Aave token
const cDAITokenAddress = networkConfig[network.config.chainId].cDAIToken; //Compound token

const wbtcTokenAddress = networkConfig[network.config.chainId].wBTCToken;
const aBTCContractAddress = networkConfig[network.config.chainId].aWBTCToken; //Aave token
const cBTCTokenAddress = networkConfig[network.config.chainId].cWBTCToken; //Compound token

//Put all the addresses in an object for easier access
const tokenAddrObj = {
  [wethTokenAddress]: [aWETHContractAddress, cETHContractAddress],
  [daiTokenAddress]: [aDAIContractAddress, cDAITokenAddress],
  [wbtcTokenAddress]: [aBTCContractAddress, cBTCTokenAddress],
};

//Deploy a pool contract with rebalancing features, and its token contract
async function deployManageMultiple(
  assetName,
  assetAddr,
  name,
  symbol,
  isWBTC = false
) {
  const mantissa = isWBTC ? 8 : 18;
  const aTokenAddr = tokenAddrObj[assetAddr][0];
  const cTokenAddr = tokenAddrObj[assetAddr][1];
  rebalancerTokenContract = await deployContract("RebalancerToken", [
    mantissa,
    name,
    symbol,
    cTokenAddr,
    assetAddr,
  ]);
  //Deploy both lending protocols
  const compContract =
    assetAddr === wethTokenAddress ? "ManageCompWETH" : "ManageComp";
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

  const allProtocols = [...manageProtocols, manageMultiple];
  for (const protocols of allProtocols) {
    await rebalancerTokenContract.setAuthorised(protocols.address, true);
  }

  await rebalancerTokenContract.setManageProtocol(manageMultiple.address);
  await manageAave.setWrapper(manageMultiple.address, true);
  await manageComp.setWrapper(manageMultiple.address, true);

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
  return [manageMultiple.address, rebalancerTokenContract.address];
}

//Deploy a contract that leverages Aave, and its token contract
async function deployManageAave(
  assetName,
  assetAddr,
  name,
  symbol,
  isWBTC = false
) {
  const mantissa = isWBTC ? 8 : 18;
  let aTokenAddr = tokenAddrObj[assetAddr][0];
  rebalancerTokenContract = await deployContract("RebalancerToken", [
    mantissa,
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
  return [manageAave.address, rebalancerTokenContract.address];
}

//Deploy a contract that leverages Compound (ETH ONLY), and its token contract
async function deployManageCompWETH(
  assetName,
  assetAddr,
  name,
  symbol,
  isWBTC = false
) {
  const mantissa = isWBTC ? 8 : 18;
  let cETHContractAddress = tokenAddrObj[assetAddr][1];
  rebalancerTokenContract = await deployContract("RebalancerToken", [
    mantissa,
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
  return [manageComp.address, rebalancerTokenContract.address];
}

//Deploy a contract that leverages Compound, and its token contract
async function deployManageComp(assetName, assetAddr, name, symbol, isWBTC) {
  let cTokenAddr = tokenAddrObj[assetAddr][1];
  const mantissa = isWBTC ? 8 : 18;
  rebalancerTokenContract = await deployContract("RebalancerToken", [
    mantissa,
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
  return [manageComp.address, rebalancerTokenContract.address];
}

module.exports = {
  deployManageMultiple,
  deployManageAave,
  deployManageCompWETH,
  deployManageComp,
};
