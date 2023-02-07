const { ethers } = require("hardhat");
const { smock } = require("@defi-wonderland/smock");
const chai = require("chai");
const { expect } = chai;
chai.use(smock.matchers);
const { deployContract } = require("../helpers/testHelper");

const DEPOSIT_AMOUNT = BigInt(1e18);

describe("Manage Multiple contract", () => {
  beforeEach(async () => {
    this.accounts = await ethers.getSigners();
    this.fakeWeth = await smock.fake("IERC20");
    this.fakeRebalancer = await smock.fake("RebalancerToken");
    this.fakeManageAave = await smock.fake("ManageAave");
    this.fakeManageComp = await smock.fake("ManageComp");
    this.fakeCETH = await smock.fake("ICETH");

    this.fakeManageAave.getRebalancerTokenAddress.returns(
      this.fakeRebalancer.address
    );

    this.fakeManageAave.getAsset.returns(this.fakeWeth.address);
    this.fakeWeth.approve.returns(true);
    this.fakeManageAave.getAPR.returns(1);
    this.fakeManageComp.getAPR.returns(2);

    const manageProtocols = [
      this.fakeManageAave.address,
      this.fakeManageComp.address,
    ];
    this.manageMultiple = await deployContract("ManageMultiple", [
      manageProtocols,
    ]);
  });
  describe("👍 getCurrentBest()", () => {
    it("returns contract with the highest APR", async () => {
      expect(await this.manageMultiple.getCurrentBest()).to.be.equal(
        this.fakeManageComp.address
      );
    });
  });

  describe("getAsset()", () => {
    it("returns asset", async () => {
      expect(await this.manageMultiple.getAsset()).to.be.equal(
        this.fakeWeth.address
      );
    });
  });

  describe("📈 getAPR()", () => {
    it("returns current APR", async () => {
      expect(await this.manageMultiple.getAPR()).to.be.equal(2);
    });
  });

  describe("getProtocols", () => {
    it("returns protocols used", async () => {
      this.fakeManageAave.getProtocols.returns(["AAVE"]);
      this.fakeManageComp.getProtocols.returns(["COMP"]);
      const arr = ["AAVE", "COMP"];
      expect(await this.manageMultiple.getProtocols()).to.eql(arr);
    });
  });

  describe("Supply", () => {
    it("reverts when user did not approve the contract on asset contract", async () => {
      this.fakeWeth.allowance.returns(0);
      await expect(this.manageMultiple.supply(this.accounts[0].address, 1)).to
        .be.reverted;
    });
    it("reverts when user did not approve enough allowance", async () => {
      this.fakeWeth.allowance.returns(1);
      await expect(this.manageMultiple.supply(this.accounts[0].address, 2)).to
        .be.reverted;
    });
    it("success when user approve enough allowance", async () => {
      this.fakeWeth.allowance.returns(3);
      await expect(this.manageMultiple.supply(this.accounts[0].address, 2)).to
        .not.be.reverted;
    });
  });

  describe("Withdraw", () => {
    it("reverts when user did not approve the contract on Rebalancer token contract", async () => {
      this.fakeRebalancer.allowance.returns(0);
      await expect(this.manageMultiple.withdraw(this.accounts[0].address, 1)).to
        .be.reverted;
    });
    it("reverts when user did not approve enough allowance", async () => {
      this.fakeRebalancer.allowance.returns(1);
      await expect(this.manageMultiple.withdraw(this.accounts[0].address, 2)).to
        .be.reverted;
    });
    it("success when user approve enough allowance", async () => {
      this.fakeRebalancer.allowance.returns(3);
      await expect(this.manageMultiple.withdraw(this.accounts[0].address, 2)).to
        .not.be.reverted;
    });
  });

  describe("getRebalancerTokenAddress", () => {
    it("returns Rebalancer token address", async () => {
      expect(await this.manageMultiple.getRebalancerTokenAddress()).to.be.equal(
        this.fakeRebalancer.address
      );
    });
  });
  describe("Rebalance", () => {
    it("does not occur when there's no protocol with a bigger APR", async () => {
      this.fakeWeth.balanceOf.returns(0);

      await this.manageMultiple.rebalance();

      expect(this.fakeManageComp.getpToken).to.have.callCount(0);

      expect(await this.manageMultiple.getCurrentBest()).to.be.equal(
        this.fakeManageComp.address
      );
    });

    it("does not occur when the contract does not hold any protocol token", async () => {
      this.fakeManageAave.getAPR.returns(2);
      this.fakeManageComp.getAPR.returns(1);

      this.fakeManageComp.getpToken.returns(this.fakeCETH.address);
      this.fakeCETH.balanceOf.returns(0);
      this.fakeRebalancer.totalSupply.returns(1);

      await this.manageMultiple.rebalance();

      expect(this.fakeManageComp.getpToken).to.have.callCount(1);
      expect(this.fakeManageComp.rebalancingWithdraw).to.have.callCount(0);
      expect(await this.manageMultiple.getCurrentBest()).to.be.equal(
        this.fakeManageAave.address
      );
    });

    it("does not occur when no Rebalancer has been minted", async () => {
      this.fakeManageAave.getAPR.returns(2);
      this.fakeManageComp.getAPR.returns(1);

      this.fakeManageComp.getpToken.returns(this.fakeCETH.address);
      this.fakeCETH.balanceOf.returns(1);
      this.fakeRebalancer.totalSupply.returns(0);

      await this.manageMultiple.rebalance();

      expect(this.fakeManageComp.getpToken).to.have.callCount(1);
      expect(this.fakeManageComp.rebalancingWithdraw).to.have.callCount(0);
      expect(await this.manageMultiple.getCurrentBest()).to.be.equal(
        this.fakeManageAave.address
      );
    });

    it("occurs when there's a protocol with a bigger APR", async () => {
      this.fakeManageAave.getAPR.returns(2);
      this.fakeManageComp.getAPR.returns(1);
      this.fakeManageComp.getpToken.returns(this.fakeCETH.address);

      this.fakeCETH.balanceOf.returns(1);
      this.fakeRebalancer.totalSupply.returns(1);

      await this.manageMultiple.rebalance();

      expect(this.fakeManageComp.rebalancingWithdraw).to.have.been.called;
      expect(await this.manageMultiple.getCurrentBest()).to.be.equal(
        this.fakeManageAave.address
      );
    });
  });
});
