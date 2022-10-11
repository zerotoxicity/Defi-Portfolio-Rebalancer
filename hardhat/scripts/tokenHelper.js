const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

//Amount to convert to WETH
const AMOUNT = ethers.utils.parseEther("1");

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

//Approve spender to spend signer's ERC20 token
async function approveToken(erc20Addr, signer, spender, amount) {
  const erc20Contract = await ethers.getContractAt("IERC20", erc20Addr, signer);
  var txResponse = await erc20Contract.approve(spender, amount);
  await txResponse.wait(1);
  console.log("Approved!\n");
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

module.exports = { getWeth, getBalance, approveToken, AMOUNT };
