pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ICToken.sol";
import "../EnumDeclaration.sol";

import "hardhat/console.sol";

//For individual protocols
contract RebalancerToken is ERC20, Ownable {
    //Address of protocol token e.g., aWETH, COMP tokens
    address private _pToken;
    //Underlying asset e.g., WETH
    address private _underlying;
    Protocols private _protocol;
    mapping(address => bool) private minter;

    constructor(
        string memory name,
        string memory symbol,
        address pToken,
        address underlying,
        uint8 protocolIndex
    ) ERC20(name, symbol) {
        _pToken = pToken;
        _underlying = underlying;
        _protocol = Protocols(protocolIndex);
        minter[msg.sender] = true;
    }

    modifier onlyMinter() {
        require(minter[msg.sender] == true, "Not minter");
        _;
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

    function getProtocol() public view returns (Protocols) {
        return _protocol;
    }

    function setProtocol(Protocols protocol) public onlyOwner {
        _protocol = protocol;
    }

    function getMinter(address account) public view returns (bool) {
        return minter[account];
    }

    function addMinter(address account) public onlyOwner {
        minter[account] = true;
    }

    function removeMinter(address account) public onlyOwner {
        minter[account] = false;
    }

    //Conversion rate of Rebalancer Token to the amount of _pToken held by the pool smart contract, e.g., 5 Rebalancer-aWETH Token == 5 aWeth
    /// @param account refers to the pool smart contract
    function rToPtokenConversionRate(address account)
        public
        view
        returns (uint256)
    {
        uint256 pTokenAmount = IERC20(_pToken).balanceOf(account);
        return (pTokenAmount * 10**18) / totalSupply();
    }

    function _getConversionRate()
        private
        view
        returns (uint256 conversionRate)
    {
        if (_protocol == Protocols.AAVE) {
            conversionRate = 1; //Conversion rate in Aave = 1:1
        } else if (_protocol == Protocols.COMPOUND) {
            conversionRate = ICToken(_pToken).exchangeRateStored();
        }
    }

    /// Get Rebalancer Token price in underlying asset. e.g., 5 Rebalancer token == 5 WETH
    function getRebalancerPrice(address manageProtocol)
        public
        view
        virtual
        returns (uint256 price)
    {
        uint256 conversionRate = _getConversionRate();

        price =
            (rToPtokenConversionRate(manageProtocol) * conversionRate) /
            10**18; //Price in underlying asset
    }

    //Mint Rebalancer Tokens based on its price
    /// @param account the end user aka tx.origin
    /// @return mintAmount number of RebalancerToken minted
    function mintRebalancerToken(
        address account,
        uint256 amount,
        address manageProtocol
    ) external onlyMinter returns (uint256 mintAmount) {
        if (totalSupply() != 0) {
            //msg.sender will be the pool contract
            mintAmount =
                (amount * (10**18)) /
                getRebalancerPrice(manageProtocol);
        } else if (totalSupply() == 0) {
            mintAmount = amount;
        }
        _mint(account, mintAmount);
    }

    /// Withdrawing of Rebalancer Token
    /// Redemption of pToken will be done in another contract
    function withdrawRebalancerToken(
        uint256 amount,
        address account,
        address manageProtocol
    ) external virtual onlyMinter returns (uint[2] memory) {
        require(totalSupply() > 0, "No token to withdraw");
        //Convert rebalancerToken to protocol Tokens
        uint256 amtOfPTokens = (amount *
            rToPtokenConversionRate(manageProtocol)) / 10**18;
        console.log(amtOfPTokens);
        require(amtOfPTokens > 0, "Amt of pTokens ==0");
        _burn(account, amount);
        return ([amtOfPTokens, amtOfPTokens * _getConversionRate()]);
    }
}
