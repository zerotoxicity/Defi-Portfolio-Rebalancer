//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../interfaces/IWETH.sol";
import "../interfaces/ICETH.sol";
import "./ManageComp.sol";

//Mantissa = 10^18
contract ManageCompWETH is ManageComp {
    function initialize(
        address pToken,
        address rebalancerToken,
        address asset
    ) public override initializer {
        ManageComp.initialize(pToken, rebalancerToken, asset);
    }

    //Receive eth
    receive() external payable {}

    function _supplyProtocol(uint256 amount) internal override {
        IWETH(_asset).withdraw(amount);
        ICETH(_pToken).mint{value: amount}();
        bool temp = ICETH(_pToken).transfer(
            _rebalancerToken,
            ICETH(_pToken).balanceOf(address(this))
        );
    }

    function _withdrawProtocol(
        address account,
        uint256 amount
    ) internal override {
        uint256 temp = ICETH(_pToken).redeem(amount);
        uint256 expectedValue = address(this).balance;
        IWETH(_asset).deposit{value: expectedValue}();
        IWETH(_asset).transfer(account, expectedValue);
    }

    function _supply(address account, uint256 amount) internal override {
        mintRebalancerTokens(account, amount);
        _supplyProtocol(amount);
    }

    // Convert WETH to ETH then deposit
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

    //Convert CETH -> ETH -> WETH
    function withdraw(
        address account,
        uint256 amount
    ) public override moreThanZero(amount) {
        _withdraw(account, amount);
    }
}
