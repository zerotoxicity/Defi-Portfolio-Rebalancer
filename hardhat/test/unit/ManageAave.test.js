const { ethers } = require("hardhat");
const { smock } = require("@defi-wonderland/smock");
const chai = require("chai");
const { expect } = chai;
const { deployContract } = require("../helpers/testHelper");

const DEPOSIT_AMOUNT = BigInt(1e18);

chai.use(smock.matchers);

describe(" ManageAave contract", () => {
  beforeEach(async () => {
    this.accounts = await ethers.getSigners();

    //Fakes
    this.fakeWeth = await smock.fake("IWETH");
    this.fakeaWETH = await smock.fake("IAToken");
    this.fakeLendingPool = await smock.fake("ILendingPool");
    this.fakeLendingPoolAddressProvider = await smock.fake(
      "ILendingPoolAddressesProvider"
    );

    this.fakeaWETH.UNDERLYING_ASSET_ADDRESS.returns(this.fakeWeth.address);
    this.fakeLendingPoolAddressProvider.getLendingPool.returns(
      this.fakeLendingPool.address
    );

    //Deploy
    this.rebalancerTokenContract = await deployContract("RebalancerToken", [
      18,
      "RAaveWETH",
      "RAWETH",
      this.fakeaWETH.address,
      this.fakeWeth.address,
    ]);

    this.manageAaveContract = await deployContract("ManageAave", [
      this.fakeaWETH.address,
      this.rebalancerTokenContract.address,
      this.fakeLendingPoolAddressProvider.address,
    ]);

    await this.rebalancerTokenContract.setAuthorised(
      this.manageAaveContract.address,
      true
    );
    await this.rebalancerTokenContract.setManageProtocol(
      this.manageAaveContract.address
    );
  });

  describe("📈 getAPR()", () => {
    it("returns APR of the protocol", async () => {
      this.fakeLendingPool.getReserveData.returns({
        configuration: { data: 0 },
        liquidityIndex: 0,
        variableBorrowIndex: 0,
        currentLiquidityRate: 1e9,
        currentVariableBorrowRate: 0,
        currentStableBorrowRate: 0,
        lastUpdateTimestamp: 0,
        aTokenAddress: this.fakeaWETH.address,
        stableDebtTokenAddress: this.fakeaWETH.address,
        variableDebtTokenAddress: this.fakeaWETH.address,
        interestRateStrategyAddress: this.fakeaWETH.address,
        id: 0,
      });
      expect(await this.manageAaveContract.getAPR()).to.be.equal(1);
    });
  });

  describe("getProtocols", () => {
    it("returns protocols used", async () => {
      const arr = ["AAVE"];
      expect(await this.manageAaveContract.getProtocols()).to.eql(arr);
    });
  });

  describe("🛠 Supply", () => {
    it("revert when amount <= 0", async () => {
      await expect(this.manageAaveContract.supply(this.accounts[0].address, 0))
        .to.be.reverted;
    });

    it("revert when caller did not approve ManageAave to spend their asset token", async () => {
      await expect(
        this.manageAaveContract.supply(this.accounts[0].address, DEPOSIT_AMOUNT)
      ).to.be.reverted;
    });

    it("mints Rebalancer token on success", async () => {
      //Approve 100 wrapped wei
      this.fakeWeth.allowance
        .whenCalledWith(
          this.accounts[0].address,
          this.manageAaveContract.address
        )
        .returns(BigInt(1e18));

      await this.manageAaveContract.supply(
        this.accounts[0].address,
        DEPOSIT_AMOUNT
      );

      expect(
        await this.rebalancerTokenContract.balanceOf(this.accounts[0].address)
      ).to.be.equal(BigInt(1e18));
    });
  });

  describe("💵 Withdraw", () => {
    it("revert when amount <= 0", async () => {
      await expect(
        this.manageAaveContract.withdraw(this.accounts[0].address, 0)
      ).to.be.reverted;
    });

    it("revert when caller did not approve ManageAave to spend their asset tokens", async () => {
      await expect(
        this.manageAaveContract.withdraw(
          this.accounts[0].address,
          DEPOSIT_AMOUNT
        )
      ).to.be.reverted;
    });

    it("burn Rebalancer tokens on success", async () => {
      //Approve 100 wrapped wei
      this.fakeWeth.allowance
        .whenCalledWith(
          this.accounts[0].address,
          this.manageAaveContract.address
        )
        .returns(DEPOSIT_AMOUNT);
      this.fakeaWETH.balanceOf.returns(DEPOSIT_AMOUNT);
      this.fakeaWETH.transfer.returns(true);

      //Deposit 100 wrapped wei into manageAave
      await this.manageAaveContract.supply(
        this.accounts[0].address,
        DEPOSIT_AMOUNT
      );

      await this.rebalancerTokenContract.approve(
        this.manageAaveContract.address,
        DEPOSIT_AMOUNT
      );

      await this.manageAaveContract.withdraw(
        this.accounts[0].address,
        DEPOSIT_AMOUNT
      );

      expect(
        await this.rebalancerTokenContract.balanceOf(this.accounts[0].address)
      ).to.be.equal(0);
    });
  });
});
