const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

//Amount to convert to WETH
const AMOUNT = ethers.utils.parseEther("1");

//Receive WETH
async function getWeth() {
  const { deployer } = await getNamedAccounts();
  const iWeth = await ethers.getContractAt(
    "IWETH",
    networkConfig[network.config.chainId].WETHToken,
    deployer
  );
  const txResponse = await iWeth.deposit({
    value: AMOUNT,
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
async function getBalance(erc20Contract, address, symbol) {
  const balance = await erc20Contract.balanceOf(address);
  console.log("💰 " + address + " -");
  console.log(
    ` ${symbol} balance: ${ethers.utils.formatEther(balance).toString()} `
  );
  console.log("-----\n");
  return balance;
}

module.exports = { getWeth, getBalance, approveToken, AMOUNT };
