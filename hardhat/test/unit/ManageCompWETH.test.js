const { ethers } = require("hardhat");
const { smock } = require("@defi-wonderland/smock");
const { deployRebalancer } = require("../helpers/testHelper");
const chai = require("chai");
const { expect } = chai;
chai.use(smock.matchers);

const DEPOSIT_AMOUNT = BigInt(1e18);

describe("ManageCompWETH contract", () => {
  beforeEach(async () => {
    this.accounts = await ethers.getSigners();

    //Fakes
    this.fakeWeth = await smock.fake("IWETH");
    this.fakeCeth = await smock.fake("ICETH");

    //Deploy
    this.rebalancerTokenContract = await deployRebalancer(
      this.fakeCeth.address,
      this.fakeWeth.address
    );
    const manageCompWETHContractFactory = await ethers.getContractFactory(
      "ManageCompWETH"
    );

    this.manageComp = await manageCompWETHContractFactory.deploy(
      this.fakeCeth.address,
      this.rebalancerTokenContract.address,
      this.fakeWeth.address
    );
    //Send 100 ETH to the contract
    await this.accounts[0].sendTransaction({
      to: this.manageComp.address,
      value: ethers.utils.parseEther("100"),
    });

    await this.rebalancerTokenContract.setAuthorised(
      this.manageComp.address,
      true
    );
    await this.rebalancerTokenContract.setManageProtocol(
      this.manageComp.address
    );
  });

  it("variables should be set", async () => {
    expect(await this.manageComp.getAsset()).to.not.equal(
      ethers.constants.AddressZero
    );
  });

  describe("🛠 Supply", () => {
    it("revert when amount <= 0", async () => {
      await expect(this.manageComp.supply(this.accounts[0].address, 0)).to.be
        .reverted;
    });

    it("revert when caller did not approve manageCompWETH to spend their asset token", async () => {
      await expect(
        this.manageComp.supply(this.accounts[0].address, DEPOSIT_AMOUNT)
      ).to.be.reverted;
    });

    it("mints Rebalancer token on success", async () => {
      this.fakeCeth.transfer.returns(true);

      //Approve 100 wrapped wei
      this.fakeWeth.allowance
        .whenCalledWith(this.accounts[0].address, this.manageComp.address)
        .returns(DEPOSIT_AMOUNT);

      await this.manageComp.supply(this.accounts[0].address, DEPOSIT_AMOUNT);

      expect(
        await this.rebalancerTokenContract.balanceOf(this.accounts[0].address)
      ).to.be.equal(DEPOSIT_AMOUNT);
    });
  });

  describe("💵 Withdraw", () => {
    it("revert when amount <= 0", async () => {
      await expect(this.manageComp.withdraw(this.accounts[0].address, 0)).to.be
        .reverted;
    });

    it("revert when caller did not approve manageCompWETH to spend their asset tokens", async () => {
      await expect(
        this.manageComp.withdraw(this.accounts[0].address, DEPOSIT_AMOUNT)
      ).to.be.reverted;
    });

    it("burn Rebalancer tokens on success", async () => {
      //Approve 100 wrapped wei
      this.fakeWeth.allowance
        .whenCalledWith(this.accounts[0].address, this.manageComp.address)
        .returns(DEPOSIT_AMOUNT);
      this.fakeCeth.balanceOf.returns(DEPOSIT_AMOUNT);
      this.fakeCeth.transfer.returns(true);

      //Deposit 100 wrapped wei into manageCompWETH
      await this.manageComp.supply(this.accounts[0].address, DEPOSIT_AMOUNT);

      await this.rebalancerTokenContract.approve(
        this.manageComp.address,
        DEPOSIT_AMOUNT
      );

      await this.manageComp.withdraw(this.accounts[0].address, DEPOSIT_AMOUNT);

      expect(
        await this.rebalancerTokenContract.balanceOf(this.accounts[0].address)
      ).to.be.equal(0);
    });
  });
});
