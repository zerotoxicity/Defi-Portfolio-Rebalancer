const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { getBalance } = require("./tokenHelper");
const selectedNetwork = network.name !== "hardhat" ? network.name : undefined;

async function getCTokenContract(account) {
  const cethAddress = networkConfig[network.config.chainId].cETHToken;
  return await ethers.getContractAt("ICToken", cethAddress, account);
}

async function getCompBalance(cTokenContract, address, symbol) {
  console.log("💰 COMP " + address + " - ");
  const exchangeRate = (await cTokenContract.exchangeRateStored()) / 1e18;
  const balance = await cTokenContract.balanceOf(address);
  console.log(symbol + " balance: " + balance);
  console.log(symbol + " in ETH: " + balance * exchangeRate);
  console.log("-----\n");
  return balance;
}

module.exports = { getCTokenContract, getCompBalance };
