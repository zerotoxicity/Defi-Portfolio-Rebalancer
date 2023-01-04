require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-deploy");
require("solidity-coverage");

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          outputSelection: {
            "*": {
              "*": ["storageLayout"],
            },
          },
        },
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
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },
};
