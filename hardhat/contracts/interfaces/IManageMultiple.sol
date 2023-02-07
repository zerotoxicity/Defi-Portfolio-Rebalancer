pragma solidity 0.8.10;

import "./ILendingProtocolCore.sol";

interface IManageMultiple is ILendingProtocolCore {
    function setManageProtocol(address[] memory manageProtocols) external;

    function rebalance() external;
}
