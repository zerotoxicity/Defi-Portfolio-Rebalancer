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

  it("Variable pToken and underlying has been set", async () => {
    await this.rebalancerTokenContract
      .connect(this.fakeAave.wallet)
      .setpToken(this.fakeaWETH.address);

    await this.rebalancerTokenContract
      .connect(this.fakeAave.wallet)
      .setUnderlying(this.fakeWeth.address);

    expect(await this.rebalancerTokenContract.getpToken()).to.be.equal(
      this.fakeaWETH.address
    );
    expect(await this.rebalancerTokenContract.getUnderlying()).to.be.equal(
      this.fakeWeth.address
    );
  });

  it("Only the owner can call setters, mint, and withdraw functions", async () => {
    await expect(
      this.rebalancerTokenContract.setpToken(this.accounts[1].address)
    ).to.be.reverted;
    await expect(
      this.rebalancerTokenContract.setUnderlying(this.accounts[1].address)
    ).to.be.reverted;
    await expect(
      this.rebalancerTokenContract.mintRTokens(
        this.accounts[0].address,
        DEPOSIT_AMOUNT
      )
    ).to.be.reverted;
    await expect(
      this.rebalancerTokenContract.withdrawRTokens(
        this.accounts[0].address,
        DEPOSIT_AMOUNT
      )
    ).to.be.reverted;
  });

  it("Contract should mint 100 RAWE when totalSupply() == 0", async () => {
    await this.rebalancerTokenContract
      .connect(this.fakeAave.wallet)
      .mintRTokens(this.accounts[0].address, DEPOSIT_AMOUNT);
    expect(
      await this.rebalancerTokenContract.balanceOf(this.accounts[0].address)
    ).to.be.equal(DEPOSIT_AMOUNT);
  });

  it("Contract should mint lesser RAWE when totalSupply() != 0", async () => {
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

  it("Contract should burn caller's Rebalancer Tokens", async () => {
    //Revert if no Rebalancer Token has been minted
    await expect(
      this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .withdrawRTokens(this.accounts[0].address, DEPOSIT_AMOUNT)
    ).to.be.reverted;

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

  it("withdrawRTokens() should revert", async () => {
    //Revert if no Rebalancer Token has been minted
    await expect(
      this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .withdrawRTokens(this.accounts[0].address, DEPOSIT_AMOUNT)
    ).to.be.reverted;

    await this.rebalancerTokenContract
      .connect(this.fakeAave.wallet)
      .mintRTokens(this.accounts[0].address, DEPOSIT_AMOUNT);

    //Mock 100 (deposited) + 5 (interest) aWETH
    this.fakeaWETH.balanceOf
      .whenCalledWith(this.rebalancerTokenContract.address)
      .returns(105);

    //Revert if the withdrawing account does not have any Rebalancer Token
    await expect(
      this.rebalancerTokenContract
        .connect(this.fakeAave.wallet)
        .withdrawRTokens(this.accounts[0].address, DEPOSIT_AMOUNT)
    ).to.be.reverted;
  });
});
