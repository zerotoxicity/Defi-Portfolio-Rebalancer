//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../interfaces/ICToken.sol";
import "../ALendingProtocol.sol";

import "hardhat/console.sol";

//Mantissa = 10^18
contract ManageComp is ALendingProtocol {
    //Underlying asset
    uint256 private _blocksPerYear;

    constructor(
        address pToken,
        address rebalancerToken,
        address asset
    ) ALendingProtocol(pToken, rebalancerToken, asset) {
        _blocksPerYear = (60 / 12) * 60 * 24 * 365;
        IERC20(_asset).approve(_pToken, type(uint256).max);
    }

    function getConversionRate() public view override returns (uint256) {
        return ICToken(_pToken).exchangeRateStored();
    }

    function _supplyProtocol(uint256 amount) internal virtual override {
        require(ICToken(_pToken).mint(amount) == 0, "Error minting COMP");
        ICToken(_pToken).transfer(
            _rebalancerToken,
            IERC20(_pToken).balanceOf(address(this))
        );
    }

    function _withdrawProtocol(address account, uint256 amount)
        internal
        virtual
        override
    {
        require(ICToken(_pToken).redeem(amount) == 0, "Error redeeming COMP");
        IERC20(_asset).transfer(
            account,
            IERC20(_asset).balanceOf(address(this))
        );
    }

    function supply(address account, uint256 amount) external virtual override {
        mintRebalancerTokens(account, amount);
        _supplyProtocol(amount);
    }

    function withdraw(address account, uint256 amount)
        external
        virtual
        override
    {
        require(amount > 0, "Amount==0");
        uint256 amtOfPTokens = withdrawRebalancerTokens(account, amount);
        _withdrawProtocol(account, amtOfPTokens);
    }

    function setBlocksPerYear(uint256 amount) external onlyOwner {
        _blocksPerYear = amount;
    }

    function getAPR() external view virtual override returns (uint256) {
        return ICToken(_pToken).supplyRatePerBlock() * _blocksPerYear;
    }
}