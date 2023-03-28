const fs = require("fs");
const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const {
  deployContract,
  addWETHToAccount,
  addWBTCToAccount,
  addDaiToAccount,
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

//Script to deploy contracts onto the network
async function main() {
  var contractsObj = {};

  console.log("⏳ Deploying..");
  //WETH
  const ETH_M = await deployManageMultiple(
    "WETH",
    wethContractAddress,
    "RMETH",
    "RME"
  );
  const ETH_A = await deployManageAave(
    "WETH",
    wethContractAddress,
    "RAETH",
    "RAE"
  );
  const ETH_C = await deployManageCompWETH(
    "WETH",
    wethContractAddress,
    "RCETH",
    "RCE"
  );
  console.log("💰 WETH deployed!\n\n");
  const WETH_Contracts = {
    manageMultiple: ETH_M,
    manageAave: ETH_A,
    manageComp: ETH_C,
  };

  //DAI
  const DAI_M = await deployManageMultiple(
    "DAI",
    daiTokenAddress,
    "RMDAI",
    "RMD"
  );
  const DAI_A = await deployManageAave("DAI", daiTokenAddress, "RADAI", "RAD");
  const DAI_C = await deployManageComp("DAI", daiTokenAddress, "RCDAI", "RCD");
  console.log("🪙 DAI deployed!\n\n");
  const DAI_Contracts = {
    manageMultiple: DAI_M,
    manageAave: DAI_A,
    manageComp: DAI_C,
  };

  const BTC_M = await deployManageMultiple(
    "WBTC",
    wbtcTokenAddress,
    "RMBTC",
    "RMB",
    true
  );
  const BTC_A = await deployManageAave(
    "WBTC",
    wbtcTokenAddress,
    "RABTC",
    "RAB",
    true
  );
  const BTC_C = await deployManageComp(
    "WBTC",
    wbtcTokenAddress,
    "RCBTC",
    "RCB",
    true
  );
  const WBTC_Contracts = {
    manageMultiple: BTC_M,
    manageAave: BTC_A,
    manageComp: BTC_C,
  };

  contractsObj["WETH"] = WETH_Contracts;
  contractsObj["DAI"] = DAI_Contracts;
  contractsObj["WBTC"] = WBTC_Contracts;
  const contractsJSON = JSON.stringify(contractsObj);
  fs.writeFileSync(
    __dirname + "/../../next-js/helper/contractAddresses.js",
    "export const addresses = " + contractsJSON,
    "utf8",
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
  console.log("✅ All deployed!");
}

//Deploy a contract with Rebalancing features, and its token contract
async function deployManageMultiple(
  assetName,
  assetAddr,
  name,
  symbol,
  isWBTC = false
) {
  const mantissa = isWBTC ? 8 : 18;
  let aTokenAddr = tokenAddrObj[assetAddr][0];
  let cTokenAddr = tokenAddrObj[assetAddr][1];
  rebalancerTokenContract = await deployContract("RebalancerToken", [
    mantissa,
    name,
    symbol,
    cTokenAddr,
    assetAddr,
  ]);
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
