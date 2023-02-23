pragma solidity 0.8.10;

import "./interfaces/IALendingProtocol.sol";
import "./interfaces/IManageMultiple.sol";
import "./RebalancerToken.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "hardhat/console.sol";

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
        _rebalancerToken = IALendingProtocol(manageProtocols[0])
            .getRebalancerTokenAddress();
        _asset = IALendingProtocol(manageProtocols[0]).getAsset();

        uint256 currentBestAPR;
        uint256 index;

        for (uint i = 0; i < manageProtocols.length; i++) {
            IERC20(_asset).approve(manageProtocols[i], type(uint256).max);
            IERC20(_rebalancerToken).approve(
                manageProtocols[i],
                type(uint256).max
            );

            uint256 currAPR = IALendingProtocol(manageProtocols[i]).getAPR();
            if (currAPR > currentBestAPR) {
                currentBestAPR = currAPR;
                index = i;
            }
        }
        _currentBest = manageProtocols[index];
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function supply(address account, uint256 amount) external rebalanceCheck {
        uint256 all = IERC20(_asset).allowance(msg.sender, address(this));
        require(all >= amount, "Increase allowance");

        IERC20(_asset).transferFrom(msg.sender, address(this), amount);
        IALendingProtocol(_currentBest).supply(account, amount);
    }

    function _withdraw(address account, uint256 amount) internal {
        IERC20(_rebalancerToken).transferFrom(
            msg.sender,
            address(this),
            amount
        );

        IALendingProtocol(_currentBest).withdraw(account, amount);
    }

    function withdraw(address account, uint256 amount) external rebalanceCheck {
        require(
            IERC20(_rebalancerToken).allowance(msg.sender, address(this)) >=
                amount,
            "Increase allowance"
        );
        _withdraw(account, amount);
    }

    function rebalance() external {
        _rebalance();
    }

    function _rebalance() private {
        address nextBest = _getBestAPR();
        if (_currentBest != nextBest) {
            address pToken = IALendingProtocol(_currentBest).getpToken();
            if (
                IERC20(pToken).balanceOf(_rebalancerToken) > 0 &&
                IERC20(_rebalancerToken).totalSupply() > 0
            ) {
                IALendingProtocol(_currentBest).rebalancingWithdraw(nextBest);
                IALendingProtocol(nextBest).rebalancingSupply();
            }
            IRebalancerToken(_rebalancerToken).setpToken(
                IALendingProtocol(nextBest).getpToken()
            );
            _currentBest = nextBest;
        }
    }

    function _getBestAPR() private view returns (address) {
        address nextBest = _currentBest;
        uint256 currentBestAPR = IALendingProtocol(_currentBest).getAPR();
        for (uint i = 0; i < _manageProtocols.length; i++) {
            uint256 currentIterationAPR = IALendingProtocol(_manageProtocols[i])
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
        return IALendingProtocol(_currentBest).getAPR();
    }

    function getpToken() external view returns (address) {
        return IALendingProtocol(_currentBest).getpToken();
    }

    function getProtocols() external view returns (string[] memory) {
        uint256 count = 0;
        for (uint i = 0; i < _manageProtocols.length; i++) {
            count += IALendingProtocol(_manageProtocols[i])
                .getProtocols()
                .length;
        }

        string[] memory protocolArr = new string[](count);
        count = 0;
        for (uint i = 0; i < _manageProtocols.length; i++) {
            string[] memory temp = IALendingProtocol(_manageProtocols[i])
                .getProtocols();
            for (uint k = 0; k < temp.length; k++) {
                protocolArr[count++] = temp[k];
            }
        }

        return protocolArr;
    }

    function getAllAPR() external view returns (uint256[] memory) {
        uint256 count = 0;
        uint256[] memory aprArr = new uint256[](_manageProtocols.length);
        for (uint256 i = 0; i < _manageProtocols.length; i++) {
            uint256 apr = IALendingProtocol(_manageProtocols[i]).getAPR();
            aprArr[count++] = apr;
        }
        return aprArr;
    }

    function getCurrentBest() external view returns (address) {
        return _currentBest;
    }

    function getConversionRate() external view returns (uint256) {
        return IALendingProtocol(_currentBest).getConversionRate();
    }

    function getRebalancerTokenAddress() external view returns (address) {
        return _rebalancerToken;
    }

    function setManageProtocol(
        address[] memory manageProtocols
    ) external onlyOwner {
        if (manageProtocols.length != 0) {
            require(
                IALendingProtocol(manageProtocols[0]).getAsset() == _asset,
                "Wrong asset"
            );
        }
        bool withinFlag = false;
        //Case 1 - currentBest is within new manageProtocols
        for (uint i = 0; i < manageProtocols.length; i++) {
            if (_currentBest == manageProtocols[i]) withinFlag = true;
        }
        if (withinFlag) {
            _manageProtocols = manageProtocols;
            _rebalance();
        }
        //Case 2 - current best protocol is not within new manageProtocol
        else {
            address newBest;
            uint256 bestAPR = 0;
            for (uint i = 0; i < manageProtocols.length; i++) {
                if (bestAPR < IALendingProtocol(manageProtocols[i]).getAPR()) {
                    newBest = manageProtocols[i];
                }
            }
            IALendingProtocol(_currentBest).rebalancingWithdraw(newBest);
            IALendingProtocol(newBest).rebalancingSupply();
            IRebalancerToken(_rebalancerToken).setpToken(
                IALendingProtocol(newBest).getpToken()
            );
        }
        _manageProtocols = manageProtocols;
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
