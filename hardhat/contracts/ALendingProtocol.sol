pragma solidity 0.8.10;

import "./interfaces/IRebalancerToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract ALendingProtocol is Ownable {
    //aToken e.g., aWETH
    address internal _pToken;
    //Underlying asset e.g., WETH
    address internal _asset;
    address internal _rebalancerToken;
    bool internal _solo = true;

    modifier grouped() {
        require(!_solo, "Solo wrapper does not have rebalancing feature");
        _;
    }

    modifier moreThanZero(uint256 amount) {
        require(amount > 0, "Amount <=0");
        _;
    }
    modifier allowanceCheck(address account, uint256 amount) {
        require(
            IERC20(_asset).allowance(msg.sender, address(this)) >= amount,
            "Require approval"
        );
        _;
    }

    constructor(
        address pToken,
        address rebalancerToken,
        address asset
    ) {
        _pToken = pToken;
        _asset = asset;
        _rebalancerToken = rebalancerToken;
    }

    function getConversionRate() public view virtual returns (uint256);

    function getAPR() external view virtual returns (uint256);

    function _supplyProtocol(uint256 amount) internal virtual;

    // function supply(address account) external virtual;

    function supply(address account, uint256 amount) external virtual;

    function _withdrawProtocol(address account, uint256 amount)
        internal
        virtual;

    // function withdraw(address account) external virtual;

    function withdraw(address account, uint256 amount) external virtual;

    function getRebalancerTokenAddress() external view returns (address) {
        return _rebalancerToken;
    }

    function getAsset() external view returns (address) {
        return _asset;
    }

    function getPToken() external view returns (address) {
        return _pToken;
    }

    function setSolo(bool solo) external onlyOwner {
        _solo = solo;
    }

    function mintRebalancerTokens(address account, uint256 amount)
        internal
        allowanceCheck(account, amount)
    {
        IERC20(_asset).transferFrom(msg.sender, address(this), amount);
        IRebalancerToken(_rebalancerToken).mintRTokens(account, amount);
    }

    function withdrawRebalancerTokens(address account, uint256 amount)
        public
        returns (uint256)
    {
        return
            IRebalancerToken(_rebalancerToken).withdrawRTokens(account, amount);
    }

    function rebalancingSupply() external grouped onlyOwner {
        _supplyProtocol(IERC20(_asset).balanceOf(address(this)));
    }

    function rebalancingWithdraw(address nextBest) external grouped onlyOwner {
        _withdrawProtocol(
            _rebalancerToken,
            IERC20(_pToken).balanceOf(address(this))
        );
        require(
            IERC20(_asset).transfer(
                nextBest,
                IERC20(_asset).balanceOf(address(this))
            ),
            "Fail to withdraw"
        );
    }
}
