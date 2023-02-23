require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-deploy");
require("@openzeppelin/hardhat-upgrades");
require("solidity-coverage");

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const GOERLI_KEY = process.env.GOERLI_KEY;

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
      chainId: 1337,
      forking: {
        url: `${MAINNET_RPC_URL}`,
      },
    },

    localhost: {
      chainId: 1337,
    },

    goerli: {
      url: `${GOERLI_RPC_URL}`,
      accounts: [GOERLI_KEY],
      chainId: 5,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },
};
