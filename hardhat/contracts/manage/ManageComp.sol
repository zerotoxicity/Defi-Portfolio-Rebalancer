//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../interfaces/misc/ICToken.sol";
import "../ALendingProtocol.sol";

//Mantissa = 10^18
contract ManageComp is ALendingProtocol {
    uint256 private _blocksPerYear;
    string private _protocol;

    /**
     * Constructor
     * @param pToken Address of the protocol token
     * @param rebalancerToken Address of rToken tied to this contract
     * @param asset Address of underlying asset
     */
    function initialize(
        address pToken,
        address rebalancerToken,
        address asset
    ) public virtual initializer {
        __ALendingProtocol_init(pToken, rebalancerToken, asset);

        //As of March 2023, one block is mined every 12s
        _blocksPerYear = (60 / 12) * 60 * 24 * 365;
        IERC20(_asset).approve(_pToken, type(uint256).max);
        _protocol = "COMP";
    }

    /**
     * Get conversion rate from Compound
     * @dev Compound conversion rate of underlying to cToken can be attained
     * from invoking the cToken's exchangeRateStored() function
     *
     * @inheritdoc ILendingProtocolCore
     */
    function getConversionRate() public view override returns (uint256) {
        return ICToken(_pToken).exchangeRateStored();
    }

    ///@inheritdoc ILendingProtocolCore
    function getProtocols() external view override returns (string[] memory) {
        string[] memory temp = new string[](1);
        temp[0] = _protocol;
        return temp;
    }

    ///@inheritdoc ALendingProtocol
    function _supplyProtocol(uint256 amount) internal virtual override {
        uint256 temp = ICToken(_pToken).mint(amount);
        bool t = ICToken(_pToken).transfer(
            _rebalancerToken,
            IERC20(_pToken).balanceOf(address(this))
        );
    }

    ///@inheritdoc ALendingProtocol
    function _withdrawProtocol(
        address account,
        uint256 amount
    ) internal virtual override {
        uint256 temp = ICToken(_pToken).redeem(amount);
        IERC20(_asset).transfer(
            account,
            IERC20(_asset).balanceOf(address(this))
        );
    }

    /**
     * Implementation of supply function
     * Transfer rTokens to account
     */
    function _supply(
        address account,
        uint256 amount
    ) internal virtual override {
        mintRebalancerTokens(account, amount);
        _supplyProtocol(amount);
    }

    /**
     * @inheritdoc ILendingProtocolCore
     */
    function supply(
        address account,
        uint256 amount
    ) external virtual override moreThanZero(amount) {
        _supply(account, amount);
    }

    /**
     * Implementation of withdrawal function
     * Withdraw rToken from account and transfer funds to them
     */
    function _withdraw(
        address account,
        uint256 amount
    ) internal virtual override {
        uint256 amtOfPTokens = withdrawRebalancerTokens(amount);
        _withdrawProtocol(account, amtOfPTokens);
    }

    ///@inheritdoc ILendingProtocolCore
    function withdraw(
        address account,
        uint256 amount
    ) public virtual override moreThanZero(amount) {
        _withdraw(account, amount);
    }

    /**
     * Set the amount of Ethereum blocks per year
     * @param amount Amount of blocks
     */
    function setBlocksPerYear(uint256 amount) external onlyOwner {
        _blocksPerYear = amount;
    }

    ///@inheritdoc ILendingProtocolCore
    function getAllAPR() external view override returns (uint256[] memory) {
        uint256[] memory aprArr = new uint256[](1);
        aprArr[0] = getAPR();
        return aprArr;
    }

    /**
     * Retrieve the APR, of asset used in this contract, from Compound
     * @dev APR is calculated from multiplying Compound's supply rate per block and total number of blocks in a year
     */
    function getAPR() public view virtual override returns (uint256) {
        return ICToken(_pToken).supplyRatePerBlock() * _blocksPerYear;
    }

    /**
     * Get amount of Ethereum blocks per year
     */
    function getBlocksPerYear() external view returns (uint256) {
        return _blocksPerYear;
    }
}
