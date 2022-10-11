const { ethers } = require("hardhat");
const { smock } = require("@defi-wonderland/smock");
const { DEPOSIT_AMOUNT } = require("./TestHelpers");
const chai = require("chai");
const { expect } = chai;
chai.use(smock.matchers);

describe(" Manage Aave contract", () => {
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
    const rebalancerTokenContractFactory = await ethers.getContractFactory(
      "RebalancerToken"
    );
    this.rebalancerTokenContract = await rebalancerTokenContractFactory.deploy(
      "RAWETH",
      "RAWE",
      this.fakeaWETH.address,
      this.fakeWeth.address
    );

    const manageAaveContractFactory = await ethers.getContractFactory(
      "ManageAave"
    );
    this.manageAaveContract = await manageAaveContractFactory.deploy(
      this.fakeaWETH.address,
      this.rebalancerTokenContract.address,
      this.fakeLendingPoolAddressProvider.address
    );

    await this.rebalancerTokenContract.transferOwnership(
      this.manageAaveContract.address
    );
  });

  it("Caller can get APR of the protocol", async () => {
    await this.manageAaveContract.getAPR();
    expect(this.fakeLendingPool.getReserveData).to.have.been.calledOnce;
  });

  it("Caller can supply WETH to the contract", async () => {
    await expect(
      this.manageAaveContract.supply(this.accounts[0].address, DEPOSIT_AMOUNT)
    ).to.be.reverted;

    //Approve 100 wrapped wei
    this.fakeWeth.allowance
      .whenCalledWith(this.accounts[0].address, this.manageAaveContract.address)
      .returns(DEPOSIT_AMOUNT);

    await this.manageAaveContract.supply(
      this.accounts[0].address,
      DEPOSIT_AMOUNT
    );

    expect(this.fakeWeth.transferFrom).to.have.been.calledWith(
      this.accounts[0].address,
      this.manageAaveContract.address,
      DEPOSIT_AMOUNT
    );

    expect(
      await this.rebalancerTokenContract.balanceOf(this.accounts[0].address)
    ).to.be.equal(DEPOSIT_AMOUNT);

    expect(this.fakeLendingPool.deposit).to.have.been.calledOnce;
  });

  it("Caller can withdraw Rebalancer Tokens", async () => {
    await expect(
      this.manageAaveContract.withdraw(this.accounts[0].address, DEPOSIT_AMOUNT)
    ).to.be.reverted;

    //Approve 100 wrapped wei
    this.fakeWeth.allowance
      .whenCalledWith(this.accounts[0].address, this.manageAaveContract.address)
      .returns(DEPOSIT_AMOUNT);

    //Deposit 100 wrapped wei into manageAave
    await this.manageAaveContract.supply(
      this.accounts[0].address,
      DEPOSIT_AMOUNT
    );

    this.fakeaWETH.balanceOf.returns(DEPOSIT_AMOUNT);
    this.fakeaWETH.transfer.returns(true);

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

    expect(this.fakeLendingPool.withdraw).to.have.been.calledOnce;
  });
});
