const { ethers } = require("hardhat");
const { addWETHToAccount } = require("../test/helpers/testHelper");

async function main() {
  const accounts = await ethers.getSigners();
  await addWETHToAccount(accounts[0], ethers.utils.parseEther("50"));
  console.log("Giving 50 WETH to ", accounts[0].address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
