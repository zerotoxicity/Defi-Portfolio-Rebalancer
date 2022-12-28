pragma solidity 0.8.10;

import "./interfaces/ILendingProtocolCore.sol";
import "./interfaces/IRebalancerToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract ALendingProtocol is Ownable, ILendingProtocolCore {
    //aToken e.g., aWETH
    address internal _pToken;
    //Underlying asset e.g., WETH
    address internal _asset;
    address internal _rebalancerToken;
    address private _wrapper;

    modifier moreThanZero(uint256 amount) {
        require(amount > 0, "Amount <=0");
        _;
    }
    modifier allowanceCheck(uint256 amount, bool supplying) {
        if (supplying) {
            require(
                IERC20(_asset).allowance(msg.sender, address(this)) >= amount,
                "Require approval"
            );
        } else {
            require(
                IERC20(_rebalancerToken).allowance(msg.sender, address(this)) >=
                    amount,
                "Require approval"
            );
        }

        _;
    }

    constructor(address pToken, address rebalancerToken, address asset) {
        _pToken = pToken;
        _asset = asset;
        _rebalancerToken = rebalancerToken;
    }

    function _supplyProtocol(uint256 amount) internal virtual;

    function _withdrawProtocol(
        address account,
        uint256 amount
    ) internal virtual;

    function getRebalancerTokenAddress() external view returns (address) {
        return _rebalancerToken;
    }

    function getAsset() external view returns (address) {
        return _asset;
    }

    function getPToken() external view returns (address) {
        return _pToken;
    }

    function mintRebalancerTokens(
        address account,
        uint256 amount
    ) internal allowanceCheck(amount, true) {
        IERC20(_asset).transferFrom(msg.sender, address(this), amount);
        IRebalancerToken(_rebalancerToken).mintRTokens(account, amount);
    }

    function withdrawRebalancerTokens(
        uint256 amount
    ) public allowanceCheck(amount, false) returns (uint256) {
        IERC20(_rebalancerToken).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        return
            IRebalancerToken(_rebalancerToken).withdrawRTokens(
                address(this),
                amount
            );
    }

    function setWrapper(address wrapper) external onlyOwner {
        _wrapper = wrapper;
    }

    function rebalancingSupply() external {
        require(msg.sender == _wrapper, "Only callable by Rebalancer");
        _supplyProtocol(IERC20(_asset).balanceOf(address(this)));
    }

    function rebalancingWithdraw(address nextBest) external {
        require(msg.sender == _wrapper, "Only callable by Rebalancer");
        _withdrawProtocol(nextBest, IERC20(_pToken).balanceOf(address(this)));
    }

    function getWrapper() external view returns (address) {
        return _wrapper;
    }
}
