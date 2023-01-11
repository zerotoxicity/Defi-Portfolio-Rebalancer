pragma solidity 0.8.10;

import "./ILendingProtocolCore.sol";

interface IManageMultiple is ILendingProtocolCore {
    function rebalance() external;
}
