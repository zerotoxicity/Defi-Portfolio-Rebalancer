// const { network, ethers } = require("hardhat");
// const { getWeth, getBalance, approveToken, AMOUNT } = require("./tokenHelper");
// const { networkConfig } = require("../helper-hardhat-config");

// const cometAddress = networkConfig[network.config.chainId].comet;
// const compAddress = networkConfig[network.config.chainId].COMP;
// const wethAddress = networkConfig[network.config.chainId].WETHToken;
// const cometRewardsAddress = networkConfig[network.config.chainId].cometRewards;
// async function main() {
//   const accounts = await ethers.getSigners();
//   deployer = accounts[0];
//   const wethContract = await getWeth();
//   console.log("Weth balance: ", await wethContract.balanceOf(deployer.address));
//   console.log("Deploying..");
//   const rebalancerTokenContractFactory = await ethers.getContractFactory(
//     "RebalancerToken",
//     deployer
//   );
//   const rebalancerToken = await rebalancerTokenContractFactory.deploy(
//     "RAWETH",
//     "RAWE",
//     compAddress,
//     wethAddress
//   );

//   const manageCompFactory = await ethers.getContractFactory(
//     "ManageComp",
//     deployer
//   );

//   const manageComp = await manageCompFactory.deploy(
//     compAddress,
//     rebalancerToken.address,
//     wethAddress,
//     cometAddress
//   );
//   await rebalancerToken.transferOwnership(manageComp.address);
//   console.log("Deployed!");

//   await approveToken(wethAddress, deployer, manageComp.address, AMOUNT);
//   await manageComp.supply(deployer.address, AMOUNT);
//   console.log("Weth balance: ", await wethContract.balanceOf(deployer.address));
//   const comet = await ethers.getContractAt("IComet", cometAddress, deployer);
//   console.log(
//     "Collateral principal balance: ",
//     await comet.collateralBalanceOf(rebalancerToken.address, wethAddress)
//   );
//   const rewards = await ethers.getContractAt(
//     "ICometRewards",
//     cometRewardsAddress,
//     deployer
//   );
//   await rewards.claim(cometAddress, rebalancerToken.address, true);
//   console.log(
//     "Comet balance: ",
//     await comet.balanceOf(rebalancerToken.address)
//   );
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
