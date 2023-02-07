//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../interfaces/IAToken.sol";
import "../interfaces/ILendingPoolAddressesProvider.sol";
import "../interfaces/ILendingPool.sol";
import "../ALendingProtocol.sol";
import {DataTypes} from "@aave/protocol-v2/contracts/protocol/libraries/types/DataTypes.sol";

contract ManageAave is ALendingProtocol {
    address private _poolProviderAddr;
    string private _protocol;

    function initialize(
        address pToken,
        address rebalancerToken,
        address poolProviderAddr
    ) public initializer {
        __ALendingProtocol_init(
            pToken,
            rebalancerToken,
            IAToken(pToken).UNDERLYING_ASSET_ADDRESS()
        );
        _poolProviderAddr = poolProviderAddr;

        IERC20(_asset).approve(
            ILendingPoolAddressesProvider(_poolProviderAddr).getLendingPool(),
            type(uint256).max
        );
        _protocol = "AAVE";
    }

    // aToken <=> asset is 1:1
    function getConversionRate() public pure override returns (uint256) {
        return 1;
    }

    function getProtocols() external view override returns (string[] memory) {
        string[] memory temp = new string[](1);
        temp[0] = _protocol;
        return temp;
    }

    function _supplyProtocol(uint256 amount) internal override {
        address poolAddr = ILendingPoolAddressesProvider(_poolProviderAddr)
            .getLendingPool();
        ILendingPool(poolAddr).deposit(_asset, amount, _rebalancerToken, 0);
    }

    function _withdrawProtocol(
        address account,
        uint256 amount
    ) internal override {
        address poolAddr = ILendingPoolAddressesProvider(_poolProviderAddr)
            .getLendingPool();
        ILendingPool(poolAddr).withdraw(_asset, amount, account);
    }

    function _supply(
        address account,
        uint256 amount
    ) internal override moreThanZero(amount) {
        mintRebalancerTokens(account, amount);
        _supplyProtocol(amount);
    }

    function supply(
        address account,
        uint256 amount
    ) external override moreThanZero(amount) {
        _supply(account, amount);
    }

    function _withdraw(address account, uint256 amount) internal override {
        uint256 amtOfPTokens = withdrawRebalancerTokens(amount);
        _withdrawProtocol(account, amtOfPTokens);
    }

    function withdraw(
        address account,
        uint256 amount
    ) public override moreThanZero(amount) {
        _withdraw(account, amount);
    }

    function getAPR() external view override returns (uint256) {
        address lendingPoolAddr = ILendingPoolAddressesProvider(
            _poolProviderAddr
        ).getLendingPool();
        DataTypes.ReserveData memory reserveData = ILendingPool(lendingPoolAddr)
            .getReserveData(_asset);
        //Reserve data mantissa = 1e27, so divide by 1e9
        return uint256(reserveData.currentLiquidityRate) / 1e9;
    }
}
