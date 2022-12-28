//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../interfaces/IWETH.sol";
import "../interfaces/ICETH.sol";
import "./ManageComp.sol";

import "hardhat/console.sol";

//Mantissa = 10^18
contract ManageCompWETH is ManageComp {
    constructor(
        address pToken,
        address rebalancerToken,
        address asset
    ) ManageComp(pToken, rebalancerToken, asset) {}

    //Receive eth
    receive() external payable {}

    function _supplyProtocol(uint256 amount) internal override {
        IWETH(_asset).withdraw(amount);
        ICETH(_pToken).mint{value: amount}();
        require(
            ICETH(_pToken).transfer(
                _rebalancerToken,
                ICETH(_pToken).balanceOf(address(this))
            ),
            "Transfer failed"
        );
    }

    function _withdrawProtocol(address account, uint256 amount)
        internal
        override
    {
        require(ICETH(_pToken).redeem(amount) == 0, "Withdrawal failed");
        uint256 expectedValue = address(this).balance;
        IWETH(_asset).deposit{value: expectedValue}();
        IWETH(_asset).transfer(account, expectedValue);
    }

    // Convert WETH to ETH then deposit
    function supply(address account, uint256 amount)
        external
        override
        moreThanZero(amount)
    {
        mintRebalancerTokens(account, amount);
        _supplyProtocol(amount);
    }

    //Convert CETH -> ETH -> WETH
    function withdraw(address account, uint256 amount)
        external
        override
        moreThanZero(amount)
    {
        uint256 amtOfPTokens = withdrawRebalancerTokens(amount);
        _withdrawProtocol(account, amtOfPTokens);
    }
}
