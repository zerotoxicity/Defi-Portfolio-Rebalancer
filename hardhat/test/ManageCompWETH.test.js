const { ethers } = require("hardhat");
const { smock } = require("@defi-wonderland/smock");
const { DEPOSIT_AMOUNT } = require("./TestHelpers");
const chai = require("chai");
const { expect } = chai;
chai.use(smock.matchers);

describe("ManageCompWeth", () => {
  beforeEach(async () => {
    this.accounts = await ethers.getSigners();

    //Fakes
    this.fakeWeth = await smock.fake("IWETH");
    this.fakeCeth = await smock.fake("ICeth");

    //Deploy
    const rebalancerTokenContractFactory = await ethers.getContractFactory(
      "RebalancerToken"
    );
    this.rebalancerTokenContract = await rebalancerTokenContractFactory.deploy(
      "RCWETH",
      "RCWE",
      this.fakeaWETH.address,
      this.fakeWeth.address
    );
    const manageCompContractFactory = await ethers.getContractFactory(
      "ManageCompWETH"
    );
    this.manageCompContract = await manageCompContractFactory.deploy(
      this.fakeCeth.address,
      this.rebalancerTokenContract.address,
      this.fakeLendingPoolAddressProvider.address
    );
    //Send 100 ETH to the contract
    await this.accounts[0].sendTransaction({
      to: this.manageCompContract.address,
      value: ethers.utils.parseEther("100"),
    });
  });

  it("Caller can supply WETH to the contract", async () => {
    await expect(
      this.manageAaveContract.supply(this.accounts[0].address, DEPOSIT_AMOUNT)
    ).to.be.reverted;
    //Approve 100 WETH
    this.fakeWeth.allowance
      .whenCalledWith(this.accounts[0].address, this.manageAaveContract.address)
      .returns(DEPOSIT_AMOUNT);

    await this.manageCompContract.supply(
      this.accounts[0].address,
      DEPOSIT_AMOUNT
    );

    expect(this.fakeWeth.withdraw).to.be.calledOnce;
    expect(this.fakeCeth.transfer).to.be.calledOnce;
  });
});
