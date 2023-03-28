pragma solidity 0.8.10;

interface IRebalancerToken {
    /**
     * Get the address of the protocol, that Rebalancer is farming yield on, token
     */
    function getpToken() external view returns (address);

    /**
     * Get the address of the underlying asset
     */
    function getUnderlying() external view returns (address);

    /**
     * Check if entity is authorised to access RebalancerToken's functionalities
     * @param entity address of the entity that is being checked
     */
    function getAuthorised(address entity) external view returns (bool);

    /**
     * Get the address of the Rebalancer pool contract tied to this contract
     */
    function getManageProtocol() external view returns (address);

    /**
     * Set the address of the new protocol token
     * @param pToken Address of new protocol token
     */
    function setpToken(address pToken) external;

    /**
     * Set underlying asset
     * @param underlying address of new underlying
     */
    function setUnderlying(address underlying) external;

    /**
     * Change the authority of an entity
     * @param entity address of the entity
     * @param authorised new authority privilege
     */
    function setAuthorised(address entity, bool authorised) external;

    /**
     * Change the address of the Rebalancer pool contract tied to this contract
     * @param manageProtocol address of new Rebalancer pool contract
     */
    function setManageProtocol(address manageProtocol) external;

    /**
     * Mints rTokens for account
     * @dev Mint Rebalancer Tokens based on its price
     * @param account Account the rTokens are for
     * @param amount Amount to be minted
     */
    function mintRTokens(address account, uint256 amount) external;

    /**
     * Withdraw rTokens from account
     * @dev Redemption of pToken will be done in another contract
     * @param account Account the rTokens are to be withdrawn from
     * @param amount Amount to be withdrawn
     */
    function withdrawRTokens(
        address account,
        uint256 amount
    ) external returns (uint256);

    /**
     * Transfers all protocol tokens to oldRebProtocol
     * @param oldRebProtocol previously Rebalancer pool contract with the highest APY
     */
    function transferPToken(address oldRebProtocol) external returns (uint256);
}
