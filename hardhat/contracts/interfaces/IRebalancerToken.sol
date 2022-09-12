pragma solidity 0.8.10;
import "../EnumDeclaration.sol";

//For individual protocols
interface IRebalancerToken {
    function getpToken() external view returns (address);

    function getUnderlying() external view returns (address);

    function setpToken(address pToken) external;

    function setUnderlying(address underlying) external;

    function getMinter(address account) external view returns (bool);

    function addMinter(address account) external;

    function removeMinter(address account) external;

    function mintRebalancerToken(
        address account,
        uint256 amount,
        address poolContract
    ) external returns (uint256 mintAmount);

    function withdrawRebalancerToken(
        uint256 amount,
        address acount,
        address poolContract
    ) external returns (uint[2] memory);
}
