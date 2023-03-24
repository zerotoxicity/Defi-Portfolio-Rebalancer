pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ILendingProtocolCore.sol";
import "./interfaces/ICToken.sol";
import "./ALendingProtocol.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

//For individual protocols
contract RebalancerToken is
    Initializable,
    UUPSUpgradeable,
    ERC20Upgradeable,
    OwnableUpgradeable
{
    //Address of protocol token e.g., aWETH, COMP tokens
    address private _pToken;
    //Underlying asset e.g., WETH
    address private _underlying;
    address private _manageProtocol;
    mapping(address => bool) _authorised;

    function initialize(
        string memory name,
        string memory symbol,
        address pToken,
        address underlying
    ) public initializer {
        __ERC20_init(name, symbol);
        __Ownable_init();
        __UUPSUpgradeable_init();
        _pToken = pToken;
        _underlying = underlying;
        _authorised[msg.sender] = true;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    modifier onlyAuthorised() {
        require(_authorised[msg.sender] == true, "Unauthorised");
        _;
    }

    function getpToken() public view returns (address) {
        return _pToken;
    }

    function getUnderlying() public view returns (address) {
        return _underlying;
    }

    function getAuthorised(address entity) public view returns (bool) {
        return _authorised[entity];
    }

    function getManageProtocol() public view returns (address) {
        return _manageProtocol;
    }

    function setpToken(address pToken) public onlyAuthorised {
        _pToken = pToken;
    }

    function setUnderlying(address underlying) public onlyAuthorised {
        _underlying = underlying;
    }

    function setAuthorised(address entity, bool authorised) public onlyOwner {
        _authorised[entity] = authorised;
    }

    function setManageProtocol(address manageProtocol) public onlyAuthorised {
        _manageProtocol = manageProtocol;
        _authorised[manageProtocol] = true;
        _pToken = ILendingProtocolCore(manageProtocol).getpToken();
    }

    //Conversion rate of Rebalancer Token to the amount of _pToken held by this
    function rToPtokenConversionRate() public view returns (uint256) {
        uint256 pTokenAmount = IERC20(_pToken).balanceOf(address(this));
        if (pTokenAmount == 0 || totalSupply() == 0) return 0;
        return (pTokenAmount * 1e18) / totalSupply();
    }

    function _getConversionRate() private view returns (uint256) {
        require(
            _manageProtocol != address(0),
            "Manage Protocol is not defined"
        );
        return ILendingProtocolCore(_manageProtocol).getConversionRate();
    }

    /// Get Rebalancer Token price in underlying asset. e.g., 5 Rebalancer token == 5 WETH
    function getRebalancerPrice() public view virtual returns (uint256 price) {
        price = ((rToPtokenConversionRate() * _getConversionRate())); //Price in underlying asset
        if (_getConversionRate() != 1) price /= 1e18;
    }

    //Mint Rebalancer Tokens based on its price
    /// @param account the end user aka tx.origin
    function mintRTokens(
        address account,
        uint256 amount
    ) external onlyAuthorised {
        require(amount > 0, "Invalid amount");
        uint256 mintAmount;
        if (totalSupply() != 0) {
            //msg.sender will be the pool contract
            mintAmount = (amount * 1e18) / getRebalancerPrice();
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
    ) external virtual onlyAuthorised returns (uint256) {
        require(totalSupply() > 0 && amount > 0, "No token to withdraw");
        //Convert rebalancerToken to protocol Tokens
        uint256 amt = amount * rToPtokenConversionRate();
        uint256 amtOfPTokens = amt / 1e18;

        _burn(account, amount);
        address currentBest = ILendingProtocolCore(_manageProtocol)
            .getCurrentBest();
        require(
            IERC20(_pToken).transfer(currentBest, amtOfPTokens),
            "Transfer failed"
        );
        return amtOfPTokens;
    }

    function transferPToken(
        address oldProtocol
    ) external onlyAuthorised returns (uint256) {
        uint256 amount = IERC20(_pToken).balanceOf(address(this));
        IERC20(_pToken).transfer(oldProtocol, amount);
        return amount;
    }
}
