//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../interfaces/ICToken.sol";
import "../ALendingProtocol.sol";

//Mantissa = 10^18
contract ManageComp is ALendingProtocol {
    uint256 private _blocksPerYear;
    string private _protocol;

    function initialize(
        address pToken,
        address rebalancerToken,
        address asset
    ) public virtual initializer {
        __ALendingProtocol_init(pToken, rebalancerToken, asset);
        _blocksPerYear = (60 / 12) * 60 * 24 * 365;
        IERC20(_asset).approve(_pToken, type(uint256).max);
        _protocol = "COMP";
    }

    function getConversionRate() public view override returns (uint256) {
        return ICToken(_pToken).exchangeRateStored();
    }

    function getProtocols() external view override returns (string[] memory) {
        string[] memory temp = new string[](1);
        temp[0] = _protocol;
        return temp;
    }

    function _supplyProtocol(uint256 amount) internal virtual override {
        uint256 temp = ICToken(_pToken).mint(amount);
        bool t = ICToken(_pToken).transfer(
            _rebalancerToken,
            IERC20(_pToken).balanceOf(address(this))
        );
    }

    function _withdrawProtocol(
        address account,
        uint256 amount
    ) internal virtual override {
        uint256 temp = ICToken(_pToken).redeem(amount);
        IERC20(_asset).transfer(
            account,
            IERC20(_asset).balanceOf(address(this))
        );
    }

    function _supply(
        address account,
        uint256 amount
    ) internal virtual override {
        mintRebalancerTokens(account, amount);
        _supplyProtocol(amount);
    }

    function supply(
        address account,
        uint256 amount
    ) external virtual override moreThanZero(amount) {
        _supply(account, amount);
    }

    function _withdraw(
        address account,
        uint256 amount
    ) internal virtual override {
        uint256 amtOfPTokens = withdrawRebalancerTokens(amount);
        _withdrawProtocol(account, amtOfPTokens);
    }

    function withdraw(
        address account,
        uint256 amount
    ) public virtual override moreThanZero(amount) {
        _withdraw(account, amount);
    }

    function setBlocksPerYear(uint256 amount) external onlyOwner {
        _blocksPerYear = amount;
    }

    function getAllAPR() external view override returns (uint256[] memory) {
        uint256[] memory aprArr = new uint256[](1);
        aprArr[0] = getAPR();
        return aprArr;
    }

    function getAPR() public view virtual override returns (uint256) {
        return ICToken(_pToken).supplyRatePerBlock() * _blocksPerYear;
    }

    function getBlocksPerYear() external view returns (uint256) {
        return _blocksPerYear;
    }
}
