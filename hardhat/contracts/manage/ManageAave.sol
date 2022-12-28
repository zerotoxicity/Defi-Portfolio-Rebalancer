//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../interfaces/IAToken.sol";
import "../interfaces/ILendingPoolAddressesProvider.sol";
import "../interfaces/ILendingPool.sol";
import "../ALendingProtocol.sol";
import {DataTypes} from "@aave/protocol-v2/contracts/protocol/libraries/types/DataTypes.sol";

contract ManageAave is ALendingProtocol {
    ILendingPoolAddressesProvider private _poolProvider;

    constructor(
        address pToken,
        address rebalancerToken,
        address poolAddrProvider
    )
        ALendingProtocol(
            pToken,
            rebalancerToken,
            IAToken(pToken).UNDERLYING_ASSET_ADDRESS()
        )
    {
        _poolProvider = ILendingPoolAddressesProvider(poolAddrProvider);
        IERC20(_asset).approve(
            _poolProvider.getLendingPool(),
            type(uint256).max
        );
    }

    // aToken <=> asset is 1:1
    function getConversionRate() public pure override returns (uint256) {
        return 1;
    }

    function _supplyProtocol(uint256 amount) internal override {
        ILendingPool pool = ILendingPool(_poolProvider.getLendingPool());
        pool.deposit(_asset, amount, _rebalancerToken, 0);
    }

    function _withdrawProtocol(
        address account,
        uint256 amount
    ) internal override {
        ILendingPool pool = ILendingPool(_poolProvider.getLendingPool());
        pool.withdraw(_asset, amount, account);
    }

    function supply(
        address account,
        uint256 amount
    ) external override moreThanZero(amount) {
        mintRebalancerTokens(account, amount);
        _supplyProtocol(amount);
    }

    function withdraw(
        address account,
        uint256 amount
    ) external override moreThanZero(amount) {
        uint256 amtOfPTokens = withdrawRebalancerTokens(amount);
        _withdrawProtocol(account, amtOfPTokens);
    }

    function getAPR() external view override returns (uint256) {
        ILendingPool pool = ILendingPool(_poolProvider.getLendingPool());
        DataTypes.ReserveData memory reserveData = pool.getReserveData(_asset);
        //Reserve data mantissa = 1e27, so divide by 1e9
        return uint256(reserveData.currentLiquidityRate) / 1e9;
    }
}
