const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { getWeth, getBalance, approveToken, AMOUNT } = require("./tokenHelper");
const { getLendingPoolContract, getAAVEBalance } = require("./aaveHelper");
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
    wethContractAddress,
    0
  );

  console.log("📝 Rebalancer Token contract deployed!");

  const rebalancerWethMainFactory = await ethers.getContractFactory(
    "RebWethMain",
    deployer
  );
  const rebalancerWethMainContract = await rebalancerWethMainFactory.deploy(
    wethContractAddress,
    rebalancerTokenContract.address
  );

  console.log("📝 Rebalancer WETH main contract deployed!");

  await aave(
    rebalancerTokenContract,
    rebalancerWethMainContract,
    wethContract,
    deployer
  );
  // await compound();
}
//---------------------------------------------------AAVE------------------------------------------------------------
async function aave(
  rebalancerTokenContract,
  rebalancerWethMainContract,
  wethContract,
  deployer
) {
  const lendingPoolContract = await getLendingPoolContract(deployer);

  const manageAaveFactory = await ethers.getContractFactory(
    "ManageAaveERC20",
    deployer
  );
  const manageAave = await manageAaveFactory.deploy(
    aWethContractAddress,
    poolProvider,
    rebalancerTokenContract.address
  );
  console.log("📝 Manage Aave contract deployed!");
  await rebalancerTokenContract.addMinter(rebalancerWethMainContract.address);

  // //Send WETH to manageAAVE
  await approveToken(
    wethContractAddress,
    deployer,
    rebalancerWethMainContract.address,
    AMOUNT
  );
  await rebalancerWethMainContract.deposit(manageAave.address);
  console.log("✅ Supplied!");
  await getAAVEBalance(lendingPoolContract, manageAave.address);
  await getBalance(rebalancerTokenContract, deployer, "RAWE");

  await approveToken(
    rebalancerTokenContract.address,
    deployer,
    rebalancerWethMainContract.address,
    AMOUNT
  );
  await new Promise((r) => setTimeout(r, 5000));
  await getAAVEBalance(lendingPoolContract, manageAave.address);

  console.log("Withdrawing..");
  await rebalancerWethMainContract.redeem(manageAave.address);
  console.log("✅ Withdrawal complete!");
  await getAAVEBalance(lendingPoolContract, manageAave.address);
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
