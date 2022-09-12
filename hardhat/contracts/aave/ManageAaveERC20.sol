//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../interfaces/IAToken.sol";
import "../interfaces/ILendingPoolAddressesProvider.sol";
import "../interfaces/ILendingPool.sol";
import "../interfaces/IRebalancerToken.sol";
import "../EnumDeclaration.sol";
import "../ALendingProtocol.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {DataTypes} from "@aave/protocol-v2/contracts/protocol/libraries/types/DataTypes.sol";

import "hardhat/console.sol";

//Mantissa = 10^18
contract ManageAaveERC20 is ALendingProtocol {
    using SafeERC20 for IERC20;

    //aToken e.g., aWETH
    address private _token;
    //Underlying asset e.g., WETH
    address private _asset;
    address private _rebalancerToken;
    ILendingPoolAddressesProvider private _poolProvider;
    Protocols private _protocol = Protocols.AAVE;

    constructor(
        address token,
        address poolAddrProvider,
        address rebalancerToken
    ) {
        address asset = IAToken(token).UNDERLYING_ASSET_ADDRESS();
        _asset = asset;
        _token = token;
        _rebalancerToken = rebalancerToken;
        _poolProvider = ILendingPoolAddressesProvider(poolAddrProvider);
        IERC20(asset).approve(
            _poolProvider.getLendingPool(),
            type(uint256).max
        );
    }

    function getAsset() external view virtual override returns (address) {
        return _asset;
    }

    function getProtocol() external view virtual override returns (Protocols) {
        return Protocols.AAVE;
    }

    function getAPR() external virtual override returns (uint256) {
        ILendingPool pool = ILendingPool(_poolProvider.getLendingPool());
        DataTypes.ReserveData memory reserveData = pool.getReserveData(_asset);
        //Reserve data mantissa = 10^27 so divide by 10**9
        return uint256(reserveData.currentLiquidityRate) / (10**9);
    }

    //Approve token to the contract before calling supply()
    function supply(uint256 balance) external virtual override {
        ILendingPool pool = ILendingPool(_poolProvider.getLendingPool());
        pool.deposit(_asset, balance, address(this), 0);
    }

    function withdraw(uint256 amount, address account)
        external
        virtual
        override
    {
        ILendingPool pool = ILendingPool(_poolProvider.getLendingPool());
        pool.withdraw(_asset, amount, account);
    }
}
