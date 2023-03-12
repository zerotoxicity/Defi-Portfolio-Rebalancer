// ---- EDIT HERE ----
const WETH_ManageMultiple = "0xd977422c9eE9B646f64A4C4389a6C98ad356d8C4";
const WETH_ManageMultiple_R = "0x408F924BAEC71cC3968614Cb2c58E155A35e6890";

const WETH_ManageAave = "0xa31F4c0eF2935Af25370D9AE275169CCd9793DA3";
const WETH_ManageAave_R = "0x1f53E116c31F171e59f45f0752AEc5d1F5aA3714";

const WETH_ManageComp = "0x6f2E42BB4176e9A7352a8bF8886255Be9F3D2d13";
const WETH_ManageComp_R = "0xb830887eE23d3f9Ed8c27dbF7DcFe63037765475";

//--DAI
const DAI_ManageMultiple = "0x5A569Ad19272Afa97103fD4DbadF33B2FcbaA175";
const DAI_ManageMultiple_R = "0x25A1DF485cFBb93117f12fc673D87D1cddEb845a";

const DAI_ManageAave = "0x9e7F7d0E8b8F38e3CF2b3F7dd362ba2e9E82baa4";
const DAI_ManageAave_R = "0x3949c97925e5Aa13e34ddb18EAbf0B70ABB0C7d4";

const DAI_ManageComp = "0x6D712CB50297b97b79dE784d10F487C00d7f8c2C";
const DAI_ManageComp_R = "0xE7FF84Df24A9a252B6E8A5BB093aC52B1d8bEEdf";

//--WBTC
const WBTC_ManageMultiple = "0x92A00fc48Ad3dD4A8b5266a8F467a52Ac784fC83";
const WBTC_ManageMultiple_R = "0x3de00f44ce68FC56DB0e0E33aD4015C6e78eCB39";

const WBTC_ManageAave = "0xb04CB6c52E73CF3e2753776030CE85a36549c9C2";
const WBTC_ManageAave_R = "0x1c39BA375faB6a9f6E0c01B9F49d488e101C2011";

const WBTC_ManageComp = "0x6212cb549De37c25071cF506aB7E115D140D9e42";
const WBTC_ManageComp_R = "0xa195ACcEB1945163160CD5703Ed43E4f78176a54";

// -----

const G_WETH_ManageMultiple = "0xDd0AbDF62996CE29714E16b8e2F43E5f80457462";
const G_WETH_ManageMultiple_R = "0xF22E155a30FbC854743C99Aaf962Fe80dbd0b277";

const G_WETH_ManageAave = "0x8dfeBC6Df44c227B6a53FddB1cF3F964128e9e82";
const G_WETH_ManageAave_R = "0x21611adF5A7aB66187fb080659E9701B9653494B";

const G_WETH_ManageComp = "0x0b46B847f687180C6FCec975Af47a9b8728c89E7";
const G_WETH_ManageComp_R = "0x6C234d1d2739eb17786a4607f0E9d49D8F0e65Eb";

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
