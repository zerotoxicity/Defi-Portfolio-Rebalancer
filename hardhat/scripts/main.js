const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { getWeth, getBalance, approveToken, AMOUNT } = require("./tokenHelper");
const {
  getLendingPoolContract,
  getAAVEBalance,
} = require("../test/helpers/aaveHelper");
const { getCTokenContract } = require("./compoundHelper");

const wethContractAddress = networkConfig[network.config.chainId].WETHToken;
const aWethContractAddress = networkConfig[network.config.chainId].aWETHToken;
const cethContractAddress = networkConfig[network.config.chainId].cETHToken;
const poolProvider = networkConfig[network.config.chainId].aLendingPoolProvider;

async function main() {
  const { deployer } = await getNamedAccounts();

  const wethContract = await getWeth();
  await getBalance(wethContract, deployer, "WETH");

  const rebalancerTokenContractFactory = await ethers.getContractFactory(
    "RebalancerToken",
    deployer
  );
  const rebalancerTokenContract = await rebalancerTokenContractFactory.deploy(
    "RAaveWETH",
    "RAWE",
    aWethContractAddress,
    wethContractAddress
  );

  console.log("📝 Rebalancer Token contract deployed!");

  await aave(rebalancerTokenContract, wethContract, deployer);
  // await compound();
}
//---------------------------------------------------AAVE------------------------------------------------------------
async function aave(rebalancerTokenContract, wethContract, deployer) {
  const accounts = await ethers.getSigners();
  const lendingPoolContract = await getLendingPoolContract(deployer);

  const manageAaveFactory = await ethers.getContractFactory(
    "ManageAaveERC20",
    deployer
  );
  const manageAave = await manageAaveFactory.deploy(
    aWethContractAddress,
    rebalancerTokenContract.address,
    poolProvider
  );
  console.log("📝 Manage Aave contract deployed!");
  await rebalancerTokenContract.transferOwnership(manageAave.address);

  // //Send WETH to manageAAVE
  await approveToken(wethContractAddress, deployer, manageAave.address, AMOUNT);
  await manageAave.supply();
  console.log("✅ Supplied!");
  await getAAVEBalance(lendingPoolContract, rebalancerTokenContract.address);
  await getBalance(rebalancerTokenContract, deployer, "RAWE");

  await approveToken(
    rebalancerTokenContract.address,
    deployer,
    manageAave.address,
    AMOUNT
  );

  await new Promise((r) => setTimeout(r, 5000));

  //Supplying with another account;
  await wethContract.transfer(
    accounts[1].address,
    ethers.utils.parseEther("1")
  );
  console.log("Depositing from another account..");

  await approveToken(
    wethContractAddress,
    accounts[1],
    manageAave.address,
    AMOUNT
  );

  await manageAave.connect(accounts[1]).supply();
  console.log("✅ Supplied!");
  await getAAVEBalance(lendingPoolContract, rebalancerTokenContract.address);
  await getBalance(rebalancerTokenContract, accounts[1].address, "RAWE");

  await getAAVEBalance(lendingPoolContract, rebalancerTokenContract.address);

  console.log("Withdrawing..");
  await manageAave.withdraw();
  console.log("✅ Withdrawal complete!");
  await getAAVEBalance(lendingPoolContract, rebalancerTokenContract.address);
  await getBalance(rebalancerTokenContract, deployer, "RAWE");
  await getBalance(wethContract, deployer, "WETH");
}

// //---------------------------------------------------COMPOUND------------------------------------------------------------
// async function compound() {
//   // const wethContract = await getWeth();

//   const manageCompEthFactory = await ethers.getContractFactory(
//     "ManageCompWETH",
//     deployer
//   );

//   // const manageCompEthFactory = await ethers.getContractFactory(
//   //   abi,
//   //   bytecode,
//   //   deployer
//   // );
//   const manageCompEth = await manageCompEthFactory.deploy(
//     cethContractAddress,
//     wethContractAddress
//   );
//   const cethContract = await getCTokenContract(cethContractAddress);

//   await approveToken(
//     wethContractAddress,
//     deployer,
//     manageCompEth.address,
//     AMOUNT
//   );
//   await manageCompEth.supply();
//   const value = await getCompBalance(cethContract, deployer, "cETH");
//   await approveToken(
//     cethContractAddress,
//     deployer,
//     manageCompEth.address,
//     value
//   );
//   await manageCompEth.withdraw(0);
//   await getCompBalance(cethContract, deployer, "cETH");
//   await getBalance(wethContract, deployer, "wETH");
//   const supplyRate = await cethContract.supplyRatePerBlock();
//   const apy = (Math.pow((supplyRate / 1e18) * 6495 + 1, 365) - 1) * 100;
//   console.log("Apy: %d", apy);
//   await manageCompEth.getAPR();
// }
//------------------------------------------------------------------------------------------------------------------------

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
