pragma solidity 0.8.10;

import "./EnumDeclaration.sol";

abstract contract ALendingProtocol {
    function getProtocol() external view virtual returns (Protocols);

    function getAsset() external view virtual returns (address);

    function getAPR() external virtual returns (uint256);

    function supply(uint256 balance) external virtual;

    //If value = 0, withdraw all
    function withdraw(uint256 amount, address account) external virtual;
}
