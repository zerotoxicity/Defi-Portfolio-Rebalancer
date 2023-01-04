pragma solidity 0.8.10;

import "./interfaces/ILendingProtocolCore.sol";
import "./interfaces/IRebalancerToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

abstract contract ALendingProtocol is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ILendingProtocolCore
{
    //aToken e.g., aWETH
    address internal _pToken;
    //Underlying asset e.g., WETH
    address internal _asset;
    address internal _rebalancerToken;
    address private _currentBest;
    mapping(address => bool) _wrapper;

    modifier moreThanZero(uint256 amount) {
        require(amount > 0, "Amount <=0");
        _;
    }

    modifier onlyRebalancer() {
        require(msg.sender != address(0), "Wrapper is not defined");
        require(_wrapper[msg.sender], "Only callable by Rebalancer");
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

    function __ALendingProtocol_init(
        address pToken,
        address rebalancerToken,
        address asset
    ) internal onlyInitializing {
        __UUPSUpgradeable_init();
        __Ownable_init();
        _pToken = pToken;
        _asset = asset;
        _rebalancerToken = rebalancerToken;
        _currentBest = address(this);
        _wrapper[msg.sender] = true;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

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

    function getpToken() external view returns (address) {
        return _pToken;
    }

    function getCurrentBest() external view returns (address) {
        return _currentBest;
    }

    function getWrapper(address queryAddr) external view returns (bool) {
        return _wrapper[queryAddr];
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

    function setWrapper(address wrapperAddr, bool value) external onlyOwner {
        _wrapper[wrapperAddr] = value;
    }

    function rebalancingSupply() external onlyRebalancer {
        _supplyProtocol(IERC20(_asset).balanceOf(address(this)));
    }

    function rebalancingWithdraw(address nextBest) external onlyRebalancer {
        _withdrawProtocol(nextBest, IERC20(_pToken).balanceOf(address(this)));
    }
}
