//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../interfaces/IAToken.sol";
import "../interfaces/ILendingPoolAddressesProvider.sol";
import "../interfaces/ILendingPool.sol";
import "../ALendingProtocol.sol";
import {DataTypes} from "@aave/protocol-v2/contracts/protocol/libraries/types/DataTypes.sol";

import "hardhat/console.sol";

contract ManageAaveERC20 is ALendingProtocol {
    //aToken e.g., aWETH
    address private _pToken;
    ILendingPoolAddressesProvider private _poolProvider;

    constructor(
        address pToken,
        address rebalancerToken,
        address poolAddrProvider
    )
        ALendingProtocol(
            rebalancerToken,
            IAToken(pToken).UNDERLYING_ASSET_ADDRESS()
        )
    {
        _pToken = pToken;
        _poolProvider = ILendingPoolAddressesProvider(poolAddrProvider);
        IERC20(_asset).approve(
            _poolProvider.getLendingPool(),
            type(uint256).max
        );
    }

    function getPToken() external view virtual override returns (address) {
        return _pToken;
    }

    function getAPR() external virtual override returns (uint256) {
        ILendingPool pool = ILendingPool(_poolProvider.getLendingPool());
        DataTypes.ReserveData memory reserveData = pool.getReserveData(_asset);
        //Reserve data mantissa = 10^27 so divide by 10**9
        return uint256(reserveData.currentLiquidityRate) / (10**9);
    }

    // aToken <=> asset is 1:1
    function getConversionRate()
        public
        view
        virtual
        override
        returns (uint256)
    {
        return 1;
    }

    function supply() external virtual override {
        uint256 amount = mintAssetAllowance(msg.sender);
        ILendingPool pool = ILendingPool(_poolProvider.getLendingPool());
        pool.deposit(_asset, amount, _rebalancerToken, 0);
    }

    function withdraw()
        external
        virtual
        override
        returns (uint256 expectedValue)
    {
        uint256 amtOfPTokens = withdrawRebalancerAllowance();
        ILendingPool pool = ILendingPool(_poolProvider.getLendingPool());
        pool.withdraw(_asset, amtOfPTokens, msg.sender);
        expectedValue = amtOfPTokens * getConversionRate();
    }
}
