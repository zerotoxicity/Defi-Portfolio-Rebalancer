const { ethers } = require("hardhat");
const {
  addWETHToAccount,
  addWBTCToAccount,
  addDaiToAccount,
} = require("../test/helpers/testHelper");

//Script to fund account[0] with
async function main() {
  const accounts = await ethers.getSigners();
  console.log("⏳ Funding account: %s ...", accounts[0].address);
  await addWETHToAccount(accounts[0], ethers.utils.parseEther("50"));
  await addWBTCToAccount(accounts[0], ethers.utils.parseEther("50"));
  await addDaiToAccount(accounts[0], ethers.utils.parseEther("50"));
  console.log("✅ Account funded!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
