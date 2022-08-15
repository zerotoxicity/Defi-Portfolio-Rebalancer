//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "./interfaces/IAToken.sol";
import "./interfaces/ILendingPoolAddressesProvider.sol";
import "./interfaces/ILendingPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {DataTypes} from "@aave/protocol-v2/contracts/protocol/libraries/types/DataTypes.sol";

import "hardhat/console.sol";

//Mantissa = 10^18
contract ManageAave {
    using SafeERC20 for IERC20;

    //aToken
    address private _token;
    //Underlying asset
    address private _asset;
    address private _contract;
    ILendingPoolAddressesProvider private _poolProvider;

    constructor(address token, address poolAddrProvider) {
        address asset = IAToken(token).UNDERLYING_ASSET_ADDRESS();
        _asset = asset;
        _token = token;
        _poolProvider = ILendingPoolAddressesProvider(poolAddrProvider);
        IERC20(asset).approve(
            _poolProvider.getLendingPool(),
            type(uint256).max
        );
    }

    function getAPR() external view returns (uint256) {
        ILendingPool pool = ILendingPool(_poolProvider.getLendingPool());
        DataTypes.ReserveData memory reserveData = pool.getReserveData(_asset);
        console.log(reserveData.currentLiquidityRate / (10**9));
        //Reserve data mantissa = 10^27
        return uint256(reserveData.currentLiquidityRate) / (10**9);
    }

    //Send token to the contract before calling supply()
    function supply() external {
        address asset = _asset;
        uint256 balance = IERC20(asset).allowance(msg.sender, address(this));
        require(balance != 0, "Approve contract");
        IERC20(asset).transferFrom(msg.sender, address(this), balance);
        ILendingPool pool = ILendingPool(_poolProvider.getLendingPool());
        pool.deposit(asset, balance, msg.sender, 0);
    }

    function withdraw(address receiver, uint256 value)
        external
        returns (uint256 amount)
    {
        uint256 balance = IERC20(_token).allowance(msg.sender, address(this));
        require(balance != 0, "Approve contract");
        amount = (value != 0) ? value : balance;
        require(value <= balance, "Exceeded allowance");
        IERC20(_token).transferFrom(msg.sender, address(this), amount);
        ILendingPool pool = ILendingPool(_poolProvider.getLendingPool());
        pool.withdraw(_asset, amount, receiver);
    }
}
