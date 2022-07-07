require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("hardhat-deploy");

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.10",
      },
      {
        version: "0.6.12",
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: MAINNET_RPC_URL,
      },
    },
    localhost: {
      chainId: 31337,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },
};
