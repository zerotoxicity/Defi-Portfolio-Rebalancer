//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../interfaces/ICToken.sol";
import "../ALendingProtocol.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

//Mantissa = 10^18
contract ManageCompERC20 is ALendingProtocol, Ownable {
    //cToken
    address internal _pToken;
    //Underlying asset
    uint256 private _blocksPerDay;

    constructor(
        address pToken,
        address rebalancerToken,
        address asset
    ) ALendingProtocol(rebalancerToken, asset) {
        _pToken = pToken;
        _blocksPerDay = 6495; //Number of blocks/day on 11/7/22
        IERC20(_asset).approve(_pToken, type(uint256).max);
    }

    function setBlocksPerDay(uint256 amount) public onlyOwner {
        _blocksPerDay = amount;
    }

    function getPToken() external view virtual override returns (address) {
        return _pToken;
    }

    function getAPR() external virtual override returns (uint256) {
        return (ICToken(_pToken).supplyRatePerBlock() * _blocksPerDay) * 365;
    }

    function getConversionRate()
        public
        view
        virtual
        override
        returns (uint256)
    {
        return ICToken(_pToken).exchangeRateStored();
    }

    /**
Convert WETH to ETH then deposit
 */
    function supply() external virtual override {
        uint256 amount = mintAssetAllowance(msg.sender);
        require(ICToken(_pToken).mint(amount) == 0, "Error minting COMP");
        ICToken(_pToken).transfer(
            _rebalancerToken,
            IERC20(_pToken).balanceOf(address(this))
        );
    }

    //Convert CETH -> ETH -> WETH
    function withdraw()
        external
        virtual
        override
        returns (uint256 expectedValue)
    {
        uint256 amtOfPTokens = withdrawRebalancerAllowance();
        require(
            ICToken(_pToken).redeem(amtOfPTokens) == 0,
            "Error redeeming COMP"
        );
        expectedValue = amtOfPTokens * getConversionRate();
    }
}
