import { addresses } from "./contractAddresses";

// Leveraged protocols
export const ProtocolsEnum = {
  AAVE: "AAVE",
  COMP: "COMP",
};

// Tokens' symbol and name
export const TokensEnum = {
  WETH: "Wrapped Ether",
  WBTC: "Wrapped Bitcoin",
  DAI: "DAI",
};

// ERC20 Token addresses
export const AssetAddressEnum = {
  //Mainnet
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "WETH",
  "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI",
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "WBTC",
  //Goerli
  "0xcca7d1416518d095e729904aaea087dba749a4dc": "WETH",
  "0x75ab5ab1eef154c0352fc31d2428cef80c7f8b33": "DAI",
  "0xf4423f4152966ebb106261740da907662a3569c5": "WBTC",
};

const WETH_Contracts = addresses.WETH;
const DAI_Contracts = addresses.DAI;
const WBTC_Contracts = addresses.WBTC;

// Object containing all Rebalancer and rToken contract addresses
export const manageContractAddresses = {
  contracts: [
    {
      // Contracts with WETH asset
      name: "WETH",
      addr: {
        [WETH_Contracts.manageMultiple[0]]: [
          "AAVE and COMP",
          WETH_Contracts.manageMultiple[1],
        ],
        [WETH_Contracts.manageAave[0]]: ["AAVE", WETH_Contracts.manageAave[1]],
        [WETH_Contracts.manageComp[0]]: ["COMP", WETH_Contracts.manageComp[1]],
      },
      mantissa: 18,
    },
    {
      name: "DAI",
      // Contracts with DAI asset
      addr: {
        [DAI_Contracts.manageMultiple[0]]: [
          "AAVE and COMP",
          DAI_Contracts.manageMultiple[1],
        ],
        [DAI_Contracts.manageAave[0]]: ["AAVE", DAI_Contracts.manageAave[1]],
        [DAI_Contracts.manageComp[0]]: ["COMP", DAI_Contracts.manageComp[1]],
      },
      mantissa: 18,
    },
    {
      name: "WBTC",
      // Contracts with WBTC asset
      addr: {
        [WBTC_Contracts.manageMultiple[0]]: [
          "AAVE and COMP",
          WBTC_Contracts.manageMultiple[1],
        ],
        [WBTC_Contracts.manageAave[0]]: ["AAVE", WBTC_Contracts.manageAave[1]],
        [WBTC_Contracts.manageComp[0]]: ["COMP", WBTC_Contracts.manageComp[1]],
      },
      mantissa: 8,
    },
  ],
};

export const SECONDS_PER_YEAR = 31536000;
