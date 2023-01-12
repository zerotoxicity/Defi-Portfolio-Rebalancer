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

  describe("getRebalancerTokenAddress", () => {
    it("returns Rebalancer token address", async () => {
      expect(await this.manageMultiple.getRebalancerTokenAddress()).to.be.equal(
        this.fakeRebalancer.address
      );
    });
  });
  describe("Rebalance", () => {
    it("does not occur when there's no protocol with a bigger APR", async () => {
      await this.manageMultiple.rebalance();
      this.fakeWeth.balanceOf.returns(0);

      expect(this.fakeManageComp.rebalancingWithdraw).to.have.callCount(0);

      expect(await this.manageMultiple.getCurrentBest()).to.be.equal(
        this.fakeManageComp.address
      );
    });
    it("occurs when there's a protocol with a bigger APR", async () => {
      this.fakeManageAave.getAPR.returns(2);
      this.fakeManageComp.getAPR.returns(1);
      this.fakeManageComp.getpToken.returns(this.fakeCETH.address);
      this.fakeCETH.balanceOf.returns(1);

      await this.manageMultiple.rebalance();

      expect(this.fakeManageComp.rebalancingWithdraw).to.have.been.called;
      expect(await this.manageMultiple.getCurrentBest()).to.be.equal(
        this.fakeManageAave.address
      );
    });
  });
});
