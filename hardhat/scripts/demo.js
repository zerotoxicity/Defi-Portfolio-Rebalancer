const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { manageMultipleAddr } = require("./demoAddr");

async function main() {
  const accounts = await ethers.getSigners();
  const manageMultiple = await ethers.getContractAt(
    "ManageMultiple",
    manageMultipleAddr[0],
    accounts[0]
  );

  await manageMultiple.setNextBest(manageMultipleAddr[1]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
