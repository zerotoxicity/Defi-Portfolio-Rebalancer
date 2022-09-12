pragma solidity 0.8.10;

import "./EnumDeclaration.sol";
import "./ALendingProtocol.sol";
import "./interfaces/IRebalancerToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

contract RebWethMain {
    ///This contract is an interface connecting to all manage<Protocol> with the same underlying asset as _asset
    //e.g. ManageAave & ManageCOMPWeth use WETH for aWETH and cWETH

    //Address of underlying asset, e.g., WETH
    address private _asset;
    address private _rebalancerToken;
    bool private _initialised = false;

    constructor(address asset, address rebalancerToken) {
        _asset = asset;
        _rebalancerToken = rebalancerToken;
    }

    modifier matchingAssetCheck(address manageProtocol) {
        require(
            _asset == ALendingProtocol(manageProtocol).getAsset(),
            "Mismatched asset"
        );
        _;
    }

    ///@param manageProtocol address of manageXXXX contract
    function deposit(address manageProtocol)
        external
        matchingAssetCheck(manageProtocol)
    {
        uint256 balance = IERC20(_asset).allowance(msg.sender, address(this));
        require(balance != 0, "Approve contract first");
        IERC20(_asset).transferFrom(msg.sender, manageProtocol, balance);
        ALendingProtocol(manageProtocol).supply(balance);
        IRebalancerToken(_rebalancerToken).mintRebalancerToken(
            msg.sender,
            balance,
            manageProtocol
        );
    }

    function redeem(address manageProtocol)
        external
        matchingAssetCheck(manageProtocol)
        returns (uint256 expectedAmtOfAsset)
    {
        uint256 amount = IERC20(_rebalancerToken).allowance(
            msg.sender,
            address(this)
        );
        require(amount != 0, "Approve contract");
        // IERC20(_rebalancerToken).transferFrom(
        //     msg.sender,
        //     manageProtocol,
        //     amount
        // );
        uint256[2] memory params = IRebalancerToken(_rebalancerToken)
            .withdrawRebalancerToken(amount, msg.sender, manageProtocol);
        console.log(params[0]);
        expectedAmtOfAsset = params[1];
        ALendingProtocol(manageProtocol).withdraw(params[0], msg.sender);
    }
}
