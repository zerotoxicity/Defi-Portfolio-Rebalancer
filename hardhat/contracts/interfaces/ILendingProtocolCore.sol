pragma solidity 0.8.10;

interface ILendingProtocolCore {
    function supply(address account, uint256 amount) external;

    function withdraw(address account, uint256 amount) external;

    function moveToAnotherRebalancer(
        address nextRebalancer,
        uint256 amount
    ) external;

    function getAsset() external view returns (address);

    function getAPR() external view returns (uint256);

    function getpToken() external view returns (address);

    function getCurrentBest() external view returns (address);

    function getConversionRate() external view returns (uint256);

    function getRebalancerTokenAddress() external view returns (address);
}
