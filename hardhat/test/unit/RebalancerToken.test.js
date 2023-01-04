const { ethers } = require("hardhat");
const { smock } = require("@defi-wonderland/smock");
const chai = require("chai");
const { expect } = chai;
chai.use(smock.matchers);
const { deployContract } = require("../helpers/testHelper");

const DEPOSIT_AMOUNT = BigInt(1e18);

describe("💰 Rebalancer Token", () => {
  beforeEach(async () => {
    this.accounts = await ethers.getSigners();

    //Fakes declaration
    this.fakeWeth = await smock.fake("IWETH");
    this.fakeAave = await smock.fake("ALendingProtocol");
    this.fakeaWETH = await smock.fake("IAToken");

    this.rebalancerTokenContract = await deployContract("RebalancerToken", [
      "RAave-WETH",
      "RAWE",
      this.fakeaWETH.address,
      this.fakeWeth.address,
    ]);

    tx = {
      to: this.fakeAave.address,
      value: ethers.utils.parseEther("100"),
    };
    await this.accounts[1].sendTransaction(tx);
    await this.rebalancerTokenContract.setAuthorised(
      this.fakeAave.address,
      true
    );
    await this.rebalancerTokenContract.setManageProtocol(this.fakeAave.address);
    this.fakeAave.getConversionRate.returns(1);
  });

  describe("📄 pToken variable", () => {
    it("setter reverts when not called by unauthorised entity", async () => {
      await expect(
        this.rebalancerTokenContract
          .connect(this.accounts[1])
          .setpToken(this.accounts[1].address)
      ).to.be.reverted;
    });

    it("only authorised entity can call setter", async () => {
      await expect(
        this.rebalancerTokenContract.setpToken(this.fakeaWETH.address)
      ).to.not.be.reverted;

      expect(await this.rebalancerTokenContract.getpToken()).to.be.equal(
        this.fakeaWETH.address
      );
    });
  });

  describe("🪙 Underlying variable", () => {
    it("setter reverts when not called by authorised entity", async () => {
      await expect(
        this.rebalancerTokenContract
          .connect(this.accounts[1])
          .setUnderlying(this.fakeWeth.address)
      ).to.be.reverted;
    });

    it("only authorised entity can call setter", async () => {
      await expect(
        this.rebalancerTokenContract.setUnderlying(this.fakeWeth.address)
      ).to.not.be.reverted;

      expect(await this.rebalancerTokenContract.getUnderlying()).to.be.equal(
        this.fakeWeth.address
      );
    });
  });

  describe("🔨 Mint", () => {
    it("reverts when not called by authorised entities", async () => {
      await expect(
        this.rebalancerTokenContract
          .connect(this.accounts[1])
          .mintRTokens(this.accounts[0].address, DEPOSIT_AMOUNT)
      ).to.be.reverted;
    });

    it("reverts when amount == 0", async () => {
      await expect(
        this.rebalancerTokenContract.mintRTokens(this.accounts[0].address, 0)
      ).to.be.reverted;
    });

    it("when totalSupply() == 0, mint 100 RAWE ", async () => {
      await this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .mintRTokens(this.accounts[0].address, DEPOSIT_AMOUNT);
      expect(
        await this.rebalancerTokenContract.balanceOf(this.accounts[0].address)
      ).to.be.equal(DEPOSIT_AMOUNT);
    });
  });

  describe("💵 Withdraw", () => {
    it("reverts when not called by owner", async () => {
      await expect(
        this.rebalancerTokenContract
          .connect(this.accounts[1])
          .withdrawRTokens(this.accounts[0].address, DEPOSIT_AMOUNT)
      ).to.be.reverted;
    });

    it("reverts when amount == 0", async () => {
      await expect(
        this.rebalancerTokenContract.withdrawRTokens(
          this.accounts[0].address,
          0
        )
      ).to.be.reverted;
    });

    it("revert if no Rebalancer Token has been minted", async () => {
      await expect(
        this.rebalancerTokenContract
          .connect(this.fakeAave.wallet)
          .withdrawRTokens(this.accounts[0].address, DEPOSIT_AMOUNT)
      ).to.be.reverted;
    });

    it("revert if account does not have enough Rebalancer token to burn", async () => {
      await this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .mintRTokens(this.accounts[0].address, DEPOSIT_AMOUNT);

      await expect(
        this.rebalancerTokenContract
          .connect(this.fakeAave.wallet)
          .withdrawRTokens(this.accounts[1].address, DEPOSIT_AMOUNT)
      ).to.be.reverted;
    });
  });
});
