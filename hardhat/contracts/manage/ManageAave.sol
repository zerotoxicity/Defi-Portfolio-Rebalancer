//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../interfaces/misc/IAToken.sol";
import "../interfaces/misc/ILendingPoolAddressesProvider.sol";
import "../interfaces/misc/ILendingPool.sol";
import "../ALendingProtocol.sol";
import {DataTypes} from "../library/DataTypes.sol";

contract ManageAave is ALendingProtocol {
    address private _poolProviderAddr;
    string private _protocol;

    /**
     * Constructor
     * @param pToken Address of the protocol token
     * @param rebalancerToken Address of rToken tied to this contract
     * @param poolProviderAddr Address of Aave's Lending Pool Provider
     */
    function initialize(
        address pToken,
        address rebalancerToken,
        address poolProviderAddr
    ) public initializer {
        __ALendingProtocol_init(
            pToken,
            rebalancerToken,
            IAToken(pToken).UNDERLYING_ASSET_ADDRESS()
        );
        _poolProviderAddr = poolProviderAddr;

        IERC20(_asset).approve(
            ILendingPoolAddressesProvider(_poolProviderAddr).getLendingPool(),
            type(uint256).max
        );
        _protocol = "AAVE";
    }

    /**
     * Get conversion rate from Aave
     * @dev Aave conversion rate of underlying to aToken is 1
     * @inheritdoc ILendingProtocolCore
     */
    function getConversionRate() public pure override returns (uint256) {
        return 1;
    }

    ///@inheritdoc ILendingProtocolCore
    function getProtocols() external view override returns (string[] memory) {
        string[] memory temp = new string[](1);
        temp[0] = _protocol;
        return temp;
    }

    ///@inheritdoc ALendingProtocol
    function _supplyProtocol(uint256 amount) internal override {
        address poolAddr = ILendingPoolAddressesProvider(_poolProviderAddr)
            .getLendingPool();
        ILendingPool(poolAddr).deposit(_asset, amount, _rebalancerToken, 0);
    }

    ///@inheritdoc ALendingProtocol
    function _withdrawProtocol(
        address account,
        uint256 amount
    ) internal override {
        address poolAddr = ILendingPoolAddressesProvider(_poolProviderAddr)
            .getLendingPool();
        ILendingPool(poolAddr).withdraw(_asset, amount, account);
    }

    /**
     * Implementation of supply function
     * Transfer rTokens to account
     */
    function _supply(
        address account,
        uint256 amount
    ) internal override moreThanZero(amount) {
        mintRebalancerTokens(account, amount);
        _supplyProtocol(amount);
    }

    /**
     * @inheritdoc ILendingProtocolCore
     */
    function supply(
        address account,
        uint256 amount
    ) external override moreThanZero(amount) {
        _supply(account, amount);
    }

    /**
     * Implementation of withdrawal function
     * Withdraw rToken from account and transfer funds to them
     */
    function _withdraw(address account, uint256 amount) internal override {
        uint256 amtOfPTokens = withdrawRebalancerTokens(amount);
        _withdrawProtocol(account, amtOfPTokens);
    }

    ///@inheritdoc ILendingProtocolCore
    function withdraw(
        address account,
        uint256 amount
    ) public override moreThanZero(amount) {
        _withdraw(account, amount);
    }

    ///@inheritdoc ILendingProtocolCore
    function getAllAPR() external view override returns (uint256[] memory) {
        uint256[] memory aprArr = new uint256[](1);
        aprArr[0] = getAPR();
        return aprArr;
    }

    /**
     * Retrieve the APR, of asset used in this contract, from Aave
     * @dev APR is retrieved from Aave lending pool's liquidity rate
     */
    function getAPR() public view override returns (uint256) {
        address lendingPoolAddr = ILendingPoolAddressesProvider(
            _poolProviderAddr
        ).getLendingPool();
        DataTypes.ReserveData memory reserveData = ILendingPool(lendingPoolAddr)
            .getReserveData(_asset);
        //Reserve data mantissa = 1e27, so divide by 1e9
        return uint256(reserveData.currentLiquidityRate) / 1e9;
    }
}
