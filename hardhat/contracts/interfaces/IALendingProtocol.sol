pragma solidity 0.8.10;

import "./ILendingProtocolCore.sol";

interface IALendingProtocol is ILendingProtocolCore {
    function setWrapper(address wrapperAddr, bool value) external;

    function rebalancingSupply() external;

    function rebalancingWithdraw(address nextBest) external;
}
