pragma solidity 0.8.10;

interface ILendingProtocolCore {
    /**
     * Deposits underlying asset into the Rebalancer pool
     * @param account address of account that is depositing
     * @param amount amount to be deposited
     */
    function supply(address account, uint256 amount) external;

    /**
     * Withdraws rTokens into underlying asset
     * @param account address of account that is withdrawing
     * @param amount amount to be withdrawn
     */
    function withdraw(address account, uint256 amount) external;

    /**
     * Transfers msg.sender asset to another Rebalancer pool contract
     * @param nextRebalancer  Address of Rebalancer pool contract to be transferred to
     * @param amount Amount to be transferred
     */
    function moveToAnotherRebalancer(
        address nextRebalancer,
        uint256 amount
    ) external;

    /**
     * Get the address of underlying asset
     */
    function getAsset() external view returns (address);

    /**
     * Get the APR of all leveraged protocols
     */
    function getAllAPR() external view returns (uint256[] memory);

    /**
     * Get the APR of the protocol where yield is being farmed
     */
    function getAPR() external view returns (uint256);

    /**
     * Get the address of protocol token
     */
    function getpToken() external view returns (address);

    /**
     * Get the address of all leveraged protocols
     */
    function getProtocols() external view returns (string[] memory);

    /**
     * Get the address of Rebalancer pool contract leveraging the protocol - where yield is being farmed
     */
    function getCurrentBest() external view returns (address);

    /**
     * Get the conversion rate of underlying asset to protocol token
     */
    function getConversionRate() external view returns (uint256);

    /**
     * Get the address of rToken tied to this contract
     */
    function getRebalancerTokenAddress() external view returns (address);
}
