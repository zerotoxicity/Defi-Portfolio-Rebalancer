pragma solidity 0.8.10;

import "./ILendingProtocolCore.sol";

interface IManageMultiple is ILendingProtocolCore {
    /**
     * Set the array of Rebalancer pool contracts for rebalancing
     * @param manageProtocols  array of leveraged protocols
     */
    function setManageProtocol(address[] memory manageProtocols) external;

    /**
     * User can call this function to check if a rebalancing of asset is required
     */
    function rebalance() external;
}
