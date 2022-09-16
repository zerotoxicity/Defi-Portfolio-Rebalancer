pragma solidity 0.8.10;

//For individual protocols
interface IRebalancerToken {
    function getpToken() external view returns (address);

    function getUnderlying() external view returns (address);

    function setpToken(address pToken) external;

    function setUnderlying(address underlying) external;

    function mintRebalancerToken(address account, uint256 amount) external;

    function withdrawRebalancerToken(uint256 amount, address acount)
        external
        returns (uint256);
}
