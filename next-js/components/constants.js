const mainnet_WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const mainnet_DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const mainnet_WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";

const goerli_WETH = "0xcca7d1416518d095e729904aaea087dba749a4dc";
const goerli_DAI = "0x75ab5ab1eef154c0352fc31d2428cef80c7f8b33";
const goerli_WBTC = "0xf4423f4152966ebb106261740da907662a3569c5";

// ---- EDIT HERE ----
const WETH_ManageMultiple = "0x47c05BCCA7d57c87083EB4e586007530eE4539e9";
const WETH_ManageAave = "0xdB012DD3E3345e2f8D23c0F3cbCb2D94f430Be8C";
const WETH_ManageComp = "0x6e0a5725dD4071e46356bD974E13F35DbF9ef367";

const WETH_ManageMultiple_R = "0xD2D5e508C82EFc205cAFA4Ad969a4395Babce026";
const WETH_ManageAave_R = "0x532802f2F9E0e3EE9d5Ba70C35E1F43C0498772D";
const WETH_ManageComp_R = "0x1eB5C49630E08e95Ba7f139BcF4B9BA171C9a8C7";
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
  [mainnet_WETH]: "WETH",
  [mainnet_DAI]: "DAI",
  [mainnet_WBTC]: "WBTC",
  //Goerli
  [goerli_WETH]: "WETH",
  [goerli_DAI]: "DAI",
  [goerli_WBTC]: "WBTC",
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
      name: "WBTC",
      addr: {},
      mantissa: 8,
    },
    {
      name: "DAI",
      addr: {},
      mantissa: 18,
    },
  ],
};

export const rebalancerContracts = {};

export const SECONDS_PER_YEAR = 31536000;
