const { ethers } = require("hardhat");
const { smock } = require("@defi-wonderland/smock");
const chai = require("chai");
const { expect } = chai;
const { deployContract } = require("../helpers/testHelper");
chai.use(smock.matchers);

const DEPOSIT_AMOUNT = BigInt(1e18);

describe("ManageComp contract", () => {
  beforeEach(async () => {
    this.accounts = await ethers.getSigners();

    //Fakes
    this.fakeDai = await smock.fake("IERC20");
    this.fakeCToken = await smock.fake("ICToken");

    //Deploy
    this.rebalancerTokenContract = await deployContract("RebalancerToken", [
      "RCompDAI",
      "RCDAI",
      this.fakeCToken.address,
      this.fakeDai.address,
    ]);

    this.manageCompContract = await deployContract("ManageComp", [
      this.fakeCToken.address,
      this.rebalancerTokenContract.address,
      this.fakeDai.address,
    ]);

    await this.rebalancerTokenContract.setAuthorised(
      this.manageCompContract.address,
      true
    );

    await this.rebalancerTokenContract.setManageProtocol(
      this.manageCompContract.address
    );
  });

  it("variables should be set", async () => {
    expect(await this.manageCompContract.getAsset()).to.not.equal(
      ethers.constants.AddressZero
    );
  });

  describe("📈 getAPR()", () => {
    it("does not return zero", async () => {
      this.fakeCToken.supplyRatePerBlock.returns(1);
      expect(await this.manageCompContract.getAPR()).to.not.equal(0);
    });
  });

  describe("🛠 Supply", () => {
    it("revert when amount <= 0", async () => {
      await expect(this.manageCompContract.supply(this.accounts[0].address, 0))
        .to.be.reverted;
    });

    it("revert when caller did not approve manageComp to spend their asset token", async () => {
      await expect(
        this.manageCompContract.supply(this.accounts[0].address, DEPOSIT_AMOUNT)
      ).to.be.reverted;
    });

    it("mints Rebalancer token on success", async () => {
      this.fakeCToken.transfer.returns(true);

      //Approve 100 wrapped wei
      this.fakeDai.allowance
        .whenCalledWith(
          this.accounts[0].address,
          this.manageCompContract.address
        )
        .returns(DEPOSIT_AMOUNT);

      await this.manageCompContract.supply(
        this.accounts[0].address,
        DEPOSIT_AMOUNT
      );

      expect(
        await this.rebalancerTokenContract.balanceOf(this.accounts[0].address)
      ).to.be.equal(DEPOSIT_AMOUNT);
    });
  });

  describe("💵 Withdraw", () => {
    it("revert when amount <= 0", async () => {
      await expect(
        this.manageCompContract.withdraw(this.accounts[0].address, 0)
      ).to.be.reverted;
    });

    it("revert when caller did not approve manageComp to spend their asset tokens", async () => {
      await expect(
        this.manageCompContract.withdraw(
          this.accounts[0].address,
          DEPOSIT_AMOUNT
        )
      ).to.be.reverted;
    });

    it("burn Rebalancer tokens on success", async () => {
      //Approve 100 wrapped wei
      this.fakeDai.allowance
        .whenCalledWith(
          this.accounts[0].address,
          this.manageCompContract.address
        )
        .returns(DEPOSIT_AMOUNT);
      this.fakeCToken.balanceOf.returns(DEPOSIT_AMOUNT);
      this.fakeCToken.transfer.returns(true);

      //Deposit 100 wrapped wei into manageComp
      await this.manageCompContract.supply(
        this.accounts[0].address,
        DEPOSIT_AMOUNT
      );

      await this.rebalancerTokenContract.approve(
        this.manageCompContract.address,
        DEPOSIT_AMOUNT
      );

      await this.manageCompContract.withdraw(
        this.accounts[0].address,
        DEPOSIT_AMOUNT
      );

      expect(
        await this.rebalancerTokenContract.balanceOf(this.accounts[0].address)
      ).to.be.equal(0);
    });
  });
});
