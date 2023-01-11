pragma solidity 0.8.10;

import "./ALendingProtocol.sol";
import "./interfaces/IManageMultiple.sol";
import "./RebalancerToken.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ManageMultiple is
    IManageMultiple,
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    address[] private _manageProtocols;
    address private _currentBest;
    address private _asset;
    address private _rebalancerToken;

    modifier rebalanceCheck() {
        _rebalance();
        _;
    }

    function initialize(address[] memory manageProtocols) public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init();
        _manageProtocols = manageProtocols;
        _rebalancerToken = ALendingProtocol(manageProtocols[0])
            .getRebalancerTokenAddress();
        _asset = ALendingProtocol(manageProtocols[0]).getAsset();

        uint256 currentBestAPR;
        uint256 index;

        for (uint i = 0; i < manageProtocols.length; i++) {
            IERC20(_asset).approve(manageProtocols[i], type(uint256).max);
            IERC20(_rebalancerToken).approve(
                manageProtocols[i],
                type(uint256).max
            );

            uint256 currAPR = ALendingProtocol(manageProtocols[i]).getAPR();
            if (currAPR > currentBestAPR) {
                currentBestAPR = currAPR;
                index = i;
            }
        }

        _currentBest = manageProtocols[index];
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function supply(address account, uint256 amount) external rebalanceCheck {
        require(IERC20(_asset).allowance(msg.sender, address(this)) >= amount);
        IERC20(_asset).transferFrom(msg.sender, address(this), amount);
        ALendingProtocol(_currentBest).supply(account, amount);
    }

    function _withdraw(address account, uint256 amount) internal {
        IERC20(_rebalancerToken).transferFrom(
            msg.sender,
            address(this),
            amount
        );

        ALendingProtocol(_currentBest).withdraw(account, amount);
    }

    function withdraw(address account, uint256 amount) external rebalanceCheck {
        require(
            IERC20(_rebalancerToken).allowance(msg.sender, address(this)) >=
                amount
        );
        _withdraw(account, amount);
    }

    function rebalance() external {
        _rebalance();
    }

    function _rebalance() private {
        address nextBest = _getBestAPR();
        if (_currentBest != nextBest) {
            ALendingProtocol(_currentBest).rebalancingWithdraw(nextBest);
            ALendingProtocol(nextBest).rebalancingSupply();
            IRebalancerToken(_rebalancerToken).setpToken(
                ALendingProtocol(nextBest).getpToken()
            );
            _currentBest = nextBest;
        }
    }

    function _getBestAPR() private view returns (address) {
        address nextBest = _currentBest;
        uint256 currentBestAPR = ALendingProtocol(_currentBest).getAPR();
        for (uint i = 0; i < _manageProtocols.length; i++) {
            uint256 currentIterationAPR = ALendingProtocol(_manageProtocols[i])
                .getAPR();
            if (currentIterationAPR > currentBestAPR) {
                nextBest = _manageProtocols[i];
                currentBestAPR = currentIterationAPR;
            }
        }
        return nextBest;
    }

    function getAsset() external view returns (address) {
        return _asset;
    }

    function getAPR() external view returns (uint256) {
        return ALendingProtocol(_currentBest).getAPR();
    }

    function getpToken() external view returns (address) {
        return ALendingProtocol(_currentBest).getpToken();
    }

    function getCurrentBest() external view returns (address) {
        return _currentBest;
    }

    function getConversionRate() external view returns (uint256) {
        return ALendingProtocol(_currentBest).getConversionRate();
    }

    function getRebalancerTokenAddress() external view returns (address) {
        return _rebalancerToken;
    }

    function moveToAnotherRebalancer(
        address nextRebalancer,
        uint256 amount
    ) external {
        require(
            OwnableUpgradeable(nextRebalancer).owner() == owner(),
            "Not a Rebalancer"
        );
        require(
            ILendingProtocolCore(nextRebalancer).getAsset() == _asset,
            "Different asset"
        );
        _withdraw(address(this), amount);
        uint256 balance = IERC20(_asset).balanceOf(address(this));
        IERC20(_asset).approve(nextRebalancer, balance);
        ILendingProtocolCore(nextRebalancer).supply(msg.sender, balance);
    }
}
