// //SPDX-License-Identifier: UNLICENSED
// pragma solidity 0.8.10;

// import "../interfaces/ICToken.sol";
// import "../interfaces/IComet.sol";
// import "../ALendingProtocol.sol";

// import "hardhat/console.sol";

// //Mantissa = 10^18
// contract ManageComp is ALendingProtocol {
//     //Address of Compound's Comet
//     address _comet;

//     constructor(
//         address pToken,
//         address rebalancerToken,
//         address asset,
//         address comet
//     ) ALendingProtocol(pToken, rebalancerToken, asset) {
//         _comet = comet;
//         IERC20(_asset).approve(_comet, type(uint256).max);
//     }

//     function getConversionRate() public view override returns (uint256) {
//         return ICToken(_pToken).exchangeRateStored();
//     }

//     function _supplyProtocol(uint256 amount) internal virtual override {
//         IComet(_comet).supplyTo(_rebalancerToken, _asset, amount);
//     }

//     function _withdrawProtocol(address account, uint256 amount)
//         internal
//         override
//     {
//         IComet(_comet).withdrawTo(account, _asset, amount);
//     }

//     function supply(address account, uint256 amount) external virtual override {
//         mintRebalancerTokens(account, amount);
//         _supplyProtocol(amount);
//     }

//     function withdraw(address account, uint256 amount) external override {
//         require(amount > 0, "Amount==0");
//         uint256 amtOfPTokens = withdrawRebalancerTokens(account, amount);
//         _withdrawProtocol(account, amtOfPTokens);
//     }

//     function getAPR() external view virtual override returns (uint256) {
//         uint256 secondsPerYear = 60 * 60 * 24 * 365;
//         uint256 utilization = IComet(_comet).getUtilization();
//         return IComet(_comet).getSupplyRate(utilization) * secondsPerYear;
//     }
// }
