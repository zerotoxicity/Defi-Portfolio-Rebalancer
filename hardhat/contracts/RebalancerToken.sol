pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/rebalancer/ILendingProtocolCore.sol";
import "./interfaces/misc/ICToken.sol";
import "./ALendingProtocol.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "hardhat/console.sol";

//For individual protocols
contract RebalancerToken is
    IRebalancerToken,
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
    uint256 private _mantissa;
    mapping(address => bool) _authorised;

    /// Modifier to check that if msg.sender is authorised to invoke Rebalancer Token functions
    modifier onlyAuthorised() {
        require(_authorised[msg.sender] == true, "Unauthorised");
        _;
    }

    /**
     * Constructor
     * @param mantissa Number of decimal places for rToken
     * @param name Name of token
     * @param symbol Symbol of token
     * @param pToken Address of the protocol, that Rebalancer is currently farming yield on, token
     * @param underlying Address of underlying asset
     */
    function initialize(
        uint8 mantissa,
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
        _mantissa = mantissa;
    }

    /**
     * Decimals of the token
     */
    function decimals() public view override returns (uint8) {
        return uint8(_mantissa);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    ///@inheritdoc IRebalancerToken
    function getpToken() public view returns (address) {
        return _pToken;
    }

    ///@inheritdoc IRebalancerToken
    function getUnderlying() public view returns (address) {
        return _underlying;
    }

    ///@inheritdoc IRebalancerToken
    function getAuthorised(address entity) public view returns (bool) {
        return _authorised[entity];
    }

    ///@inheritdoc IRebalancerToken
    function getManageProtocol() public view returns (address) {
        return _manageProtocol;
    }

    ///@inheritdoc IRebalancerToken
    function setpToken(address pToken) public onlyAuthorised {
        _pToken = pToken;
    }

    ///@inheritdoc IRebalancerToken
    function setUnderlying(address underlying) public onlyAuthorised {
        _underlying = underlying;
    }

    ///@inheritdoc IRebalancerToken
    function setAuthorised(address entity, bool authorised) public onlyOwner {
        _authorised[entity] = authorised;
    }

    ///@inheritdoc IRebalancerToken
    function setManageProtocol(address manageProtocol) public onlyAuthorised {
        _manageProtocol = manageProtocol;
        _authorised[manageProtocol] = true;
        _pToken = ILendingProtocolCore(manageProtocol).getpToken();
    }

    /**
     * Conversion rate of Rebalancer Token to the amount of _pToken
     */
    function rToPtokenConversionRate() public view returns (uint256) {
        uint256 pTokenAmount = IERC20(_pToken).balanceOf(address(this));
        if (pTokenAmount == 0 || totalSupply() == 0) return 0;
        return (pTokenAmount * 10 ** _mantissa) / totalSupply();
    }

    /**
     * Get conversion rate of pTokens to its underlying asset
     */
    function _getConversionRate() private view returns (uint256) {
        require(
            _manageProtocol != address(0),
            "Manage Protocol is not defined"
        );
        return ILendingProtocolCore(_manageProtocol).getConversionRate();
    }

    /**
     * Get Rebalancer Token price in underlying asset. e.g., 5 Rebalancer token == 5 WETH
     */
    function getRebalancerPrice() public view virtual returns (uint256 price) {
        price = ((rToPtokenConversionRate() * _getConversionRate())); //Price in underlying asset
        if (_getConversionRate() != 1) price /= 10 ** _mantissa;
    }

    ///@inheritdoc IRebalancerToken
    function mintRTokens(
        address account,
        uint256 amount
    ) external onlyAuthorised {
        require(amount > 0, "Invalid amount");
        uint256 mintAmount;
        if (totalSupply() != 0) {
            //msg.sender will be the pool contract
            mintAmount = (amount * 10 ** _mantissa) / getRebalancerPrice();
        } else if (totalSupply() == 0) {
            mintAmount = amount;
        }
        _mint(account, mintAmount);
    }

    ///@inheritdoc IRebalancerToken
    function withdrawRTokens(
        address account,
        uint256 amount
    ) external virtual onlyAuthorised returns (uint256) {
        require(totalSupply() > 0 && amount > 0, "No token to withdraw");
        //Convert rebalancerToken to protocol Tokens
        uint256 amt = amount * rToPtokenConversionRate();
        uint256 amtOfPTokens = amt / 10 ** _mantissa;

        _burn(account, amount);
        address currentBest = ILendingProtocolCore(_manageProtocol)
            .getCurrentBest();
        require(
            IERC20(_pToken).transfer(currentBest, amtOfPTokens),
            "Transfer failed"
        );
        return amtOfPTokens;
    }

    ///@inheritdoc IRebalancerToken
    function transferPToken(
        address oldRebProtocol
    ) external onlyAuthorised returns (uint256) {
        uint256 amount = IERC20(_pToken).balanceOf(address(this));
        IERC20(_pToken).transfer(oldRebProtocol, amount);
        return amount;
    }
}
