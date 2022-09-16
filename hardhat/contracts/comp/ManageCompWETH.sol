//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../interfaces/IWETH.sol";
import "../interfaces/ICETH.sol";
import "./ManageCompERC20.sol";

import "hardhat/console.sol";

//Mantissa = 10^18
contract ManageCompWETH is ManageCompERC20 {
    using SafeERC20 for IERC20;

    //Underlying asset
    uint256 private _blocksPerDay;

    constructor(
        address pToken,
        address rebalancerToken,
        address asset
    ) ManageCompERC20(pToken, rebalancerToken, asset) {
        _blocksPerDay = 6495; //Number of blocks/day on 11/7/22
    }

    //Receive eth
    receive() external payable {}

    /**
Convert WETH to ETH then deposit
 */
    function supply() external virtual override {
        uint256 amount = mintAssetAllowance(msg.sender);
        IWETH(_asset).withdraw(amount);
        ICETH(_pToken).mint{value: amount}();
        IERC20(_pToken).safeTransfer(
            msg.sender,
            IERC20(_pToken).balanceOf(address(this))
        );
    }

    //Convert CETH -> ETH -> WETH
    function withdraw()
        external
        virtual
        override
        returns (uint256 expectedValue)
    {
        uint256 amtOfPTokens = withdrawRebalancerAllowance();
        require(ICETH(_pToken).redeem(amtOfPTokens) == 0, "Withdrawal failed");
        IWETH(_asset).deposit{value: address(this).balance}();
        expectedValue = IWETH(_asset).balanceOf(address(this));
        IWETH(_asset).transfer(msg.sender, expectedValue);
    }
}
