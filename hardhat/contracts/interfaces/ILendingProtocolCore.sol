pragma solidity 0.8.10;

interface ILendingProtocolCore {
    function supply(address account, uint256 amount) external;

    function withdraw(address account, uint256 amount) external;

    function getAPR() external view returns (uint256);

    function getConversionRate() external view returns (uint256);
}
