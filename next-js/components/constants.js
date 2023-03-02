// ---- EDIT HERE ----
const WETH_ManageMultiple = "0x52173b6ac069619c206b9A0e75609fC92860AB2A";
const WETH_ManageMultiple_R = "0x0b27a79cb9C0B38eE06Ca3d94DAA68e0Ed17F953";

const WETH_ManageAave = "0x6e0a5725dD4071e46356bD974E13F35DbF9ef367";
const WETH_ManageAave_R = "0x1eB5C49630E08e95Ba7f139BcF4B9BA171C9a8C7";

const WETH_ManageComp = "0x1f53E116c31F171e59f45f0752AEc5d1F5aA3714";
const WETH_ManageComp_R = "0x6B21b3ae41f818Fc91e322b53f8D0773d31eCB75";

//--DAI
const DAI_ManageMultiple = "0x25A1DF485cFBb93117f12fc673D87D1cddEb845a";
const DAI_ManageMultiple_R = "0xF9c0bF1CFAAB883ADb95fed4cfD60133BffaB18a";

const DAI_ManageAave = "0x7036124464A2d2447516309169322c8498ac51e3";
const DAI_ManageAave_R = "0x696358bBb1a743052E0E87BeD78AAd9d18f0e1F4";

const DAI_ManageComp = "0x3949c97925e5Aa13e34ddb18EAbf0B70ABB0C7d4";
const DAI_ManageComp_R = "0x5c932424AcBfab036969b3B9D94bA9eCbae7565D";

//--WBTC
const WBTC_ManageMultiple = "0x04F339eC4D75Cf2833069e6e61b60eF56461CD7C";
const WBTC_ManageMultiple_R = "0x0724F18B2aA7D6413D3fDcF6c0c27458a8170Dd9";

const WBTC_ManageAave = "0x21915b79E1d334499272521a3508061354D13FF0";
const WBTC_ManageAave_R = "0x2f8D338360D095a72680A943A22fE6a0d398a0B4";

const WBTC_ManageComp = "0x1c39BA375faB6a9f6E0c01B9F49d488e101C2011";
const WBTC_ManageComp_R = "0x0c03eCB91Cb50835e560a7D52190EB1a5ffba797";

// -----

export const ProtocolsEnum = {
  AAVE: "AAVE",
  COMP: "COMP",
};

export const TokensEnum = {
  WETH: "Wrapped Ether",
  WBTC: "Wrapped Bitcoin",
  DAI: "DAI",
};

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

export const manageContractAddresses = {
  contracts: [
    {
      name: "WETH",
      addr: {
        [WETH_ManageMultiple]: ["AAVE and COMP", WETH_ManageMultiple_R],
        [WETH_ManageAave]: ["AAVE", WETH_ManageAave_R],
        [WETH_ManageComp]: ["COMP", WETH_ManageComp_R],
      },
      mantissa: 18,
    },
    {
      name: "DAI",
      addr: {
        [DAI_ManageMultiple]: ["AAVE and COMP", DAI_ManageMultiple_R],
        [DAI_ManageAave]: ["AAVE", DAI_ManageAave_R],
        [DAI_ManageComp]: ["COMP", DAI_ManageComp_R],
      },
      mantissa: 18,
    },
    {
      name: "WBTC",
      addr: {
        [WBTC_ManageMultiple]: ["AAVE and COMP", WBTC_ManageMultiple_R],
        [WBTC_ManageAave]: ["AAVE", WBTC_ManageAave_R],
        [WBTC_ManageComp]: ["COMP", WBTC_ManageComp_R],
      },
      mantissa: 8,
    },
  ],
};

export const SECONDS_PER_YEAR = 31536000;
