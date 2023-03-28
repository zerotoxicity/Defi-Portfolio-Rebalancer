pragma solidity 0.8.10;

import "./ILendingProtocolCore.sol";

interface IALendingProtocol is ILendingProtocolCore {
    /**
     * Set the bool value of the Rebalancer pool contract that is leveraging this contract
     * @param wrapperAddr Address of a Rebalancer pool contract with rebalancing feature
     * @param value bool
     */
    function setWrapper(address wrapperAddr, bool value) external;

    /**
     * Supply to the protocol without minting rTokens
     */
    function rebalancingSupply() external;

    /**
     * Withdraw from protocol and transfers the funds to nextBest
     * @param nextBest Address of the Rebalancer pool contract with the best APY
     */
    function rebalancingWithdraw(address nextBest) external;
}
