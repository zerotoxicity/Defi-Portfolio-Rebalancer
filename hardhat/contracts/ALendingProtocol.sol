pragma solidity 0.8.10;

import "./interfaces/IRebalancerToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

abstract contract ALendingProtocol {
    using SafeERC20 for IERC20;

    //Underlying asset e.g., WETH
    address internal _asset;
    address internal _rebalancerToken;

    constructor(address rebalancerToken, address asset) {
        _asset = asset;
        _rebalancerToken = rebalancerToken;
    }

    function getRebalancerTokenAddress() external view returns (address) {
        return _rebalancerToken;
    }

    function getPToken() external view virtual returns (address);

    function getAPR() external virtual returns (uint256);

    function getConversionRate() public view virtual returns (uint256);

    function supply() external virtual;

    //If value = 0, withdraw all
    function withdraw() external virtual returns (uint256 expectedValue);

    function getAsset() external view returns (address) {
        return _asset;
    }

    function allowanceCheck(address account, address tokenAddress)
        internal
        view
        returns (uint256 amount)
    {
        amount = IERC20(tokenAddress).allowance(account, address(this));
        require(amount != 0, "Approve contract first");
    }

    function mintAssetAllowance(address account)
        internal
        returns (uint256 amount)
    {
        amount = allowanceCheck(account, _asset);
        IERC20(_asset).transferFrom(account, address(this), amount);
        IRebalancerToken(_rebalancerToken).mintRebalancerToken(
            msg.sender,
            amount
        );
    }

    function withdrawRebalancerAllowance() internal returns (uint256) {
        uint256 amount = allowanceCheck(msg.sender, _rebalancerToken);
        return
            IRebalancerToken(_rebalancerToken).withdrawRebalancerToken(
                amount,
                msg.sender
            );
    }
}
