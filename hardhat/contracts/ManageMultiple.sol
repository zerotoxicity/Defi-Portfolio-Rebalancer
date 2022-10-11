pragma solidity 0.8.10;

import "./ALendingProtocol.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract ManageMultiple {
    address[] private _manageProtocols;
    address private _currentBest;
    address private _asset;
    address private _rebalancerToken;

    modifier rebalanceCheck() {
        rebalance();
        _;
    }

    constructor(address[] memory manageProtocols) {
        _manageProtocols = manageProtocols;
        _rebalancerToken = ALendingProtocol(manageProtocols[0])
            .getRebalancerTokenAddress();
        _asset = ALendingProtocol(manageProtocols[0]).getAsset();
        for (uint i = 0; i < manageProtocols.length; i++) {
            IERC20(_asset).approve(manageProtocols[i], type(uint256).max);
        }
    }

    function getAPR() external view returns (uint256) {
        return ALendingProtocol(_currentBest).getAPR();
    }

    function supply() external rebalanceCheck {
        uint256 amount = IERC20(_asset).allowance(msg.sender, address(this));
        ALendingProtocol(_currentBest).supply(msg.sender, amount);
    }

    function withdraw() external rebalanceCheck {
        uint256 amount = IERC20(_rebalancerToken).allowance(
            msg.sender,
            address(this)
        );
        ALendingProtocol(_currentBest).withdraw(msg.sender, amount);
    }

    function rebalance() public {
        address nextBest;
        uint256 currentBestAPR = ALendingProtocol(_currentBest).getAPR();
        for (uint i = 0; i < _manageProtocols.length; i++) {
            uint256 currentIterationAPR = ALendingProtocol(_manageProtocols[i])
                .getAPR();
            if (currentIterationAPR > currentBestAPR) {
                nextBest = _manageProtocols[i];
                currentBestAPR = currentIterationAPR;
            }
        }
        if (_currentBest != nextBest) {
            ALendingProtocol(_currentBest).rebalancingWithdraw(nextBest);
            ALendingProtocol(nextBest).rebalancingSupply();
            _currentBest = nextBest;
        }
    }
}
