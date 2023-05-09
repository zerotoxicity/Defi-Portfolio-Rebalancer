const fs = require("fs");
const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const {
  deployManageMultiple,
  deployManageAave,
  deployManageComp,
  deployManageCompWETH,
} = require("./deployHelper");

//Retrieves address of ERC20 token based on current network
const wethTokenAddress = networkConfig[network.config.chainId].WETHToken;
const daiTokenAddress = networkConfig[network.config.chainId].DAIToken;
const wbtcTokenAddress = networkConfig[network.config.chainId].wBTCToken;

//Script to deploy contracts onto the network
async function main() {
  var contractsObj = {};

  console.log("⏳ Deploying..");

  //Deploy groups of Rebalancer pool contracts
  await deployContractsGroup("WETH", contractsObj);
  await deployContractsGroup("DAI", contractsObj);
  await deployContractsGroup("WBTC", contractsObj);

  //Write an object containing the addresses of Rebalancer pool and rToken contracts
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

/**
 * Deploy groups of Rebalancer pool and rToken contracts
 * @param {*} assetName Name of the underlying asset, e.g., WETH
 * @param {*} contractsObj Object containing all of Rebalancer's contract addresses
 */
async function deployContractsGroup(assetName, contractsObj) {
  //If name contains "W", trim it
  const tokenName =
    assetName.charAt(0) !== "W" ? assetName : assetName.substring(1);

  //Get the first letter of the token name
  const firstTokenChar = tokenName.charAt(0);

  var ERC20addr;
  mantissaEight = false;
  if (assetName === "WETH") {
    ERC20addr = wethTokenAddress;
  } else if (assetName === "DAI") {
    ERC20addr = daiTokenAddress;
  } else {
    ERC20addr = wbtcTokenAddress;
    mantissaEight = true;
  }
  // Deploys Rebalancer pool contract with rebalancing feature
  const rebMultiple = await deployManageMultiple(
    tokenName,
    ERC20addr,
    "RM" + tokenName,
    "RM" + firstTokenChar,
    mantissaEight
  );

  // Deploys Rebalancer pool contract leveraging Aave
  const rebAave = await deployManageAave(
    tokenName,
    ERC20addr,
    "RA" + tokenName,
    "RA" + firstTokenChar,
    mantissaEight
  );

  var rebComp;

  // Deploys Rebalancer pool contract leveraging Compound
  if (assetName !== "WETH") {
    rebComp = await deployManageComp(
      tokenName,
      ERC20addr,
      "RC" + tokenName,
      "RC" + firstTokenChar,
      mantissaEight
    );
  } else {
    rebComp = await deployManageCompWETH(
      tokenName,
      ERC20addr,
      "RC" + tokenName,
      "RC" + firstTokenChar,
      mantissaEight
    );
  }
  // Append addresses to contractsObj
  contractsObj[assetName] = {
    manageMultiple: rebMultiple,
    manageAave: rebAave,
    manageComp: rebComp,
  };

  console.log(`💰 ${assetName} deployed!\n\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
