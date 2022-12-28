pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ILendingProtocolCore.sol";
import "./interfaces/ICToken.sol";
import "./ALendingProtocol.sol";

import "hardhat/console.sol";

//For individual protocols
contract RebalancerToken is ERC20, Ownable {
    //Address of protocol token e.g., aWETH, COMP tokens
    address private _pToken;
    //Underlying asset e.g., WETH
    address private _underlying;
    address private _deployer;

    constructor(
        string memory name,
        string memory symbol,
        address pToken,
        address underlying
    ) ERC20(name, symbol) {
        _pToken = pToken;
        _underlying = underlying;
        _deployer = msg.sender;
    }

    function getpToken() public view returns (address) {
        return _pToken;
    }

    function getUnderlying() public view returns (address) {
        return _underlying;
    }

    function setpToken(address pToken) public onlyOwner {
        _pToken = pToken;
    }

    function setUnderlying(address underlying) public onlyOwner {
        _underlying = underlying;
    }

    //Conversion rate of Rebalancer Token to the amount of _pToken held by this
    function rToPtokenConversionRate() public view returns (uint256) {
        uint256 pTokenAmount = IERC20(_pToken).balanceOf(address(this));
        if (pTokenAmount == 0 || totalSupply() == 0) return 0;
        return (pTokenAmount * 1e18) / totalSupply();
    }

    function _getConversionRate() private view returns (uint256) {
        require(owner() != _deployer, "Transfer ownership");
        return ILendingProtocolCore(owner()).getConversionRate();
    }

    /// Get Rebalancer Token price in underlying asset. e.g., 5 Rebalancer token == 5 WETH
    function getRebalancerPrice() public view virtual returns (uint256 price) {
        uint256 conversionRate = _getConversionRate();

        price = (rToPtokenConversionRate() * conversionRate); //Price in underlying asset
    }

    //Mint Rebalancer Tokens based on its price
    /// @param account the end user aka tx.origin
    function mintRTokens(address account, uint256 amount) external onlyOwner {
        require(amount > 0, "Invalid amount");
        uint256 mintAmount;
        if (totalSupply() != 0) {
            //msg.sender will be the pool contract
            mintAmount = (amount * (1e18)) / getRebalancerPrice();
        } else if (totalSupply() == 0) {
            mintAmount = amount;
        }
        _mint(account, mintAmount);
    }

    /// Withdrawing of Rebalancer Token
    /// Redemption of pToken will be done in another contract
    function withdrawRTokens(
        address account,
        uint256 amount
    ) external virtual onlyOwner returns (uint256) {
        require(totalSupply() > 0 && amount > 0, "No token to withdraw");
        //Convert rebalancerToken to protocol Tokens
        console.log("From RebalancerToken.sol");
        uint256 amt = amount * rToPtokenConversionRate();
        console.log("rToPtokenConversionRate:", rToPtokenConversionRate());
        console.log("amt: ", amt);
        uint256 amtOfPTokens = amt / 1e18;

        console.log("amtofPTokens:", amtOfPTokens);
        _burn(account, amount);
        require(
            IERC20(_pToken).transfer(owner(), amtOfPTokens),
            "Transfer failed"
        );
        return amtOfPTokens;
    }
}
