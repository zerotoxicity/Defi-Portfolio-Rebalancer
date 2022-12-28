const { ethers } = require("hardhat");
const { expect } = require("chai");
const { smock } = require("@defi-wonderland/smock");

const { DEPOSIT_AMOUNT } = require("./TestHelpers");

//This test is done using mock Aave protocol

describe("💰 Rebalancer Token", () => {
  beforeEach(async () => {
    this.accounts = await ethers.getSigners();

    //Fakes declaration
    this.fakeWeth = await smock.fake("IWETH");
    this.fakeAave = await smock.fake("ALendingProtocol");
    this.fakeaWETH = await smock.fake("IAToken");

    const rebalancerTokenContractFactory = await ethers.getContractFactory(
      "RebalancerToken"
    );
    this.rebalancerTokenContract = await rebalancerTokenContractFactory.deploy(
      "RAave-WETH",
      "RAWE",
      this.fakeaWETH.address,
      this.fakeWeth.address
    );
    tx = {
      to: this.fakeAave.address,
      value: ethers.utils.parseEther("100"),
    };
    await this.accounts[1].sendTransaction(tx);
    await this.rebalancerTokenContract.transferOwnership(this.fakeAave.address);
    this.fakeAave.getConversionRate.returns(1);
  });

  describe("📄 pToken variable", () => {
    it("setter reverts when not called by owner", async () => {
      await expect(
        this.rebalancerTokenContract.setpToken(this.accounts[1].address)
      ).to.be.reverted;
    });

    it("only owner can call setter", async () => {
      await expect(
        this.rebalancerTokenContract
          .connect(this.fakeAave.wallet)
          .setpToken(this.fakeaWETH.address)
      ).to.not.be.reverted;

      expect(await this.rebalancerTokenContract.getpToken()).to.be.equal(
        this.fakeaWETH.address
      );
    });
  });

  describe("🔁 Conversion Rate", () => {
    it("reverts when the contract owner is the deployer", async () => {
      await this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .mintRTokens(this.accounts[0].address, DEPOSIT_AMOUNT);
      this.fakeaWETH.balanceOf.returns(100);

      await this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .transferOwnership(this.accounts[0].address);
      await expect(this.rebalancerTokenContract.getRebalancerPrice()).to.be
        .reverted;
    });
    it("succeeds when the contract owner is different from the deployer", async () => {
      await this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .mintRTokens(this.accounts[0].address, DEPOSIT_AMOUNT);
      this.fakeaWETH.balanceOf.returns(100);
      expect(await this.rebalancerTokenContract.getRebalancerPrice()).to.not.be
        .reverted;
    });
  });

  describe("🔄 rToPtokenConversionRate", () => {
    it("return 0 when totalSupply is 0", async () => {
      this.fakeaWETH.balanceOf.returns(1);

      expect(
        await this.rebalancerTokenContract.rToPtokenConversionRate()
      ).to.be.equal(0);
    });
    it("return 0 when protocol token amount is 0", async () => {
      await this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .mintRTokens(this.accounts[0].address, DEPOSIT_AMOUNT);

      expect(
        await this.rebalancerTokenContract.rToPtokenConversionRate()
      ).to.be.equal(0);
    });
  });

  describe("🪙 Underlying variable", () => {
    it("setter reverts when not called by owner", async () => {
      await expect(
        this.rebalancerTokenContract.setUnderlying(this.fakeWeth.address)
      ).to.be.reverted;
    });

    it("only owner can call setter", async () => {
      await expect(
        this.rebalancerTokenContract
          .connect(this.fakeAave.wallet)
          .setUnderlying(this.fakeWeth.address)
      ).to.not.be.reverted;

      expect(await this.rebalancerTokenContract.getUnderlying()).to.be.equal(
        this.fakeWeth.address
      );
    });
  });

  describe("🔨 Mint", () => {
    it("reverts when not called by owner", async () => {
      await expect(
        this.rebalancerTokenContract.mintRTokens(
          this.accounts[0].address,
          DEPOSIT_AMOUNT
        )
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

    it("when totalSupply() != 0, mint lesser RAWE ", async () => {
      await this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .mintRTokens(this.accounts[0].address, DEPOSIT_AMOUNT);

      //Mock 100 (deposited) + 5 (interest) aWETH
      this.fakeaWETH.balanceOf
        .whenCalledWith(this.rebalancerTokenContract.address)
        .returns(105);

      await this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .mintRTokens(this.accounts[1].address, DEPOSIT_AMOUNT);

      //The minted amount will be rounded to 95
      expect(
        await this.rebalancerTokenContract.balanceOf(this.accounts[1].address)
      ).to.be.equal(BigInt(95));
    });
  });

  describe("💵 Withdraw", () => {
    it("reverts when not called by owner", async () => {
      await expect(
        this.rebalancerTokenContract.withdrawRTokens(
          this.accounts[0].address,
          DEPOSIT_AMOUNT
        )
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

    it("should burn caller's Rebalancer Tokens", async () => {
      await this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .mintRTokens(this.accounts[0].address, DEPOSIT_AMOUNT);

      //Mock 100 (deposited) + 5 (interest) aWETH
      this.fakeaWETH.balanceOf
        .whenCalledWith(this.rebalancerTokenContract.address)
        .returns(105);

      this.fakeaWETH.transfer.returns(true);

      await this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .withdrawRTokens(this.accounts[0].address, DEPOSIT_AMOUNT);

      expect(
        await this.rebalancerTokenContract.balanceOf(this.accounts[0].address)
      ).to.be.equal(BigInt(0));
    });
  });
});
