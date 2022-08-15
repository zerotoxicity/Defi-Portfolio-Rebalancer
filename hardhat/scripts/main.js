const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { getWeth, getBalance, approveToken, AMOUNT } = require("./tokenHelper");
const { getLendingPoolContract, getAAVEBalance } = require("./aaveHelper");
const { getCTokenContract } = require("./compoundHelper");
const {
  abi,
  bytecode,
} = require("../artifacts/contracts/ManageCompEth.sol/ManageCompEth.json");

const wethContractAddress = networkConfig[network.config.chainId].WETHToken;
const aWethContractAddress = networkConfig[network.config.chainId].aWETHToken;
const cethContractAddress = networkConfig[network.config.chainId].cETHToken;
const poolProvider = networkConfig[network.config.chainId].aLendingPoolProvider;

async function main() {
  await aave();
  await compound();
}
//---------------------------------------------------AAVE------------------------------------------------------------
async function aave() {
  const { deployer } = await getNamedAccounts();
  const wethContract = await getWeth();

  const lendingPoolContract = await getLendingPoolContract(deployer);

  const manageAaveFactory = await ethers.getContractFactory(
    "ManageAave",
    deployer
  );
  const manageAave = await manageAaveFactory.deploy(
    aWethContractAddress,
    poolProvider
  );

  //Send WETH to manageAAVE
  // await approveToken(wethContractAddress, deployer, manageAave.address, AMOUNT);
  // await manageAave.supply();
  // await getAAVEBalance(lendingPoolContract, deployer);
  // //Send aWETH to manageAAVE
  // await approveToken(
  //   aWethContractAddress,
  //   deployer,
  //   manageAave.address,
  //   AMOUNT
  // );
  // await manageAave.withdraw(deployer, ethers.utils.parseEther("1.0"));
  // await getBalance(wethContract, deployer, "WETH");
  await manageAave.getAPR();
}

//---------------------------------------------------COMPOUND------------------------------------------------------------
async function compound() {
  const { deployer } = await getNamedAccounts();
  // const wethContract = await getWeth();

  // const manageCompEthFactory = await ethers.getContractFactory(
  //   "ManageCompEth",
  //   deployer
  // );

  const manageCompEthFactory = await ethers.getContractFactory(
    abi,
    bytecode,
    deployer
  );
  const manageCompEth = await manageCompEthFactory.deploy(
    cethContractAddress,
    wethContractAddress
  );
  const cethContract = await getCTokenContract(cethContractAddress);

  // await approveToken(
  //   wethContractAddress,
  //   deployer,
  //   manageCompEth.address,
  //   AMOUNT
  // );
  // await manageCompEth.supply();
  // const value = await getCompBalance(cethContract, deployer, "cETH");
  // await approveToken(
  //   cethContractAddress,
  //   deployer,
  //   manageCompEth.address,
  //   value
  // );
  // await manageCompEth.withdraw(0);
  // await getCompBalance(cethContract, deployer, "cETH");
  // await getBalance(wethContract, deployer, "wETH");
  // const supplyRate = await cethContract.supplyRatePerBlock();
  // const apy = (Math.pow((supplyRate / 1e18) * 6495 + 1, 365) - 1) * 100;
  // console.log("Apy: %d", apy);
  await manageCompEth.getAPR();
}
//------------------------------------------------------------------------------------------------------------------------

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
