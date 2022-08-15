//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "./interfaces/IWETH.sol";
import "./interfaces/ICETH.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

//Mantissa = 10^18
contract ManageCompEth is Ownable {
    using SafeERC20 for IERC20;

    //cToken
    address private _token;
    //Underlying asset
    address private _asset;
    uint256 private _blocksPerDay;

    constructor(address token, address asset) {
        _token = token;
        _asset = asset;
        _blocksPerDay = 6495; //Number of blocks/day on 11/7/22
    }

    function setBlocksPerDay(uint256 amount) public onlyOwner {
        _blocksPerDay = amount;
    }

    function getAPR() external returns (uint256) {
        console.log((ICETH(_token).supplyRatePerBlock() * _blocksPerDay) * 365);
        return (ICETH(_token).supplyRatePerBlock() * _blocksPerDay) * 365;
    }

    /**
Convert WETH to ETH then deposit
 */
    function supply() external {
        address asset = _asset;
        uint256 balance = IWETH(asset).allowance(msg.sender, address(this));
        require(balance != 0, "Approve contract");
        IERC20(asset).transferFrom(msg.sender, address(this), balance);
        IWETH(asset).withdraw(balance);
        ICETH(_token).mint{value: balance}();
        IERC20 token = IERC20(_token);
        uint256 cBalance = token.balanceOf(address(this));
        token.safeTransfer(msg.sender, cBalance);
    }

    //Convert CETH -> ETH -> WETH
    function withdraw(uint256 value) external returns (uint256 amount) {
        address token = _token;
        IERC20 assetContract = IERC20(_asset);
        uint256 balance = IERC20(token).allowance(msg.sender, address(this));
        require(balance != 0, "Approve contract");
        amount = (value != 0) ? value : balance;
        IERC20(_token).safeTransferFrom(msg.sender, address(this), amount);
        require(ICETH(token).redeem(amount) == 0, "Withdrawal failed");
        IWETH(_asset).deposit{value: address(this).balance}();
        amount = assetContract.balanceOf(address(this));
        assetContract.safeTransfer(msg.sender, amount);
    }

    //Receive eth
    receive() external payable {}
}
