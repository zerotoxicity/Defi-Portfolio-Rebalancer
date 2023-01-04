const chai = require("chai");
const { expect } = chai;
const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const {
  deployContract,
  getWeth,
  AMOUNT,
  addWETHToAccount,
} = require("../helpers/testHelper");

this.wethContractAddress = networkConfig[network.config.chainId].WETHToken;
this.cETHContractAddress = networkConfig[network.config.chainId].cETHToken;

describe("Integration ManageCompWETH contract", () => {
  beforeEach(async () => {
    this.accounts = await ethers.getSigners();
    this.deployer = this.accounts[0];
    this.wethContract = await getWeth();

    //--Deployment--
    this.rebalancerTokenContract = await deployContract("RebalancerToken", [
      "RCompETH",
      "RCETH",
      this.cETHContractAddress,
      this.wethContractAddress,
    ]);
    this.manageComp = await deployContract("ManageCompWETH", [
      this.cETHContractAddress,
      this.rebalancerTokenContract.address,
      this.wethContractAddress,
    ]);
    await this.rebalancerTokenContract.setAuthorised(
      this.manageComp.address,
      true
    );
    console.log("?");
    this.cETHContract = await ethers.getContractAt(
      "ICETH",
      this.cETHContractAddress,
      this.deployer
    );

    await this.rebalancerTokenContract.setManageProtocol(
      this.manageComp.address
    );
  });

  describe("📈 getAPR()", async () => {
    it("returns APR of the protocol", async () => {
      expect(await this.manageComp.getAPR()).to.be.greaterThan(0);
    });
  });

  describe("🛠 Supply", async () => {
    beforeEach(async () => {
      await this.wethContract.approve(this.manageComp.address, AMOUNT);
      await this.manageComp.supply(this.deployer.address, AMOUNT);
    });

    it("Rebalancer Token contract has protocol tokens on a successful supply call", async () => {
      const bal = await this.cETHContract.balanceOf(
        this.rebalancerTokenContract.address
      );
      const expectedAmt = bal * (await this.manageComp.getConversionRate());
      expect(expectedAmt).to.be.greaterThan(9 * 1e17);
    });

    it("first supplier receives 1:1 protocol tokens on a successful supply call", async () => {
      expect(
        await this.rebalancerTokenContract.balanceOf(this.deployer.address)
      ).to.be.equal(AMOUNT);
    });

    it("supplier should receive scaled protocol tokens when protocol tokens>1", async () => {
      await addWETHToAccount(this.accounts[1], ethers.utils.parseEther("2"));

      await this.wethContract
        .connect(this.accounts[1])
        .approve(this.manageComp.address, AMOUNT);

      await this.manageComp
        .connect(this.accounts[1])
        .supply(this.accounts[1].address, AMOUNT);

      const bal = await this.rebalancerTokenContract.balanceOf(
        this.accounts[1].address
      );

      expect(bal).to.be.within(1, AMOUNT + 1);
    });
  });

  describe("Withdraw", () => {
    beforeEach(async () => {
      await this.wethContract.approve(this.manageComp.address, AMOUNT);
      await this.manageComp.supply(this.deployer.address, AMOUNT);
      await this.rebalancerTokenContract.approve(
        this.manageComp.address,
        AMOUNT
      );
    });

    it("caller receives more WETH than the amount supplied upon withdrawal", async () => {
      //Initial WETH is 2, so user should have more than 2 WETH after withdrawing
      await this.manageComp.withdraw(this.deployer.address, AMOUNT);
      expect(
        await this.wethContract.balanceOf(this.deployer.address)
      ).to.be.greaterThan(ethers.utils.parseEther("2"));
    });

    it("second caller receives more WETH than the amount supplied upon withdrawal", async () => {
      await addWETHToAccount(this.accounts[1], AMOUNT);

      await this.wethContract
        .connect(this.accounts[1])
        .approve(this.manageComp.address, AMOUNT);

      await this.manageComp
        .connect(this.accounts[1])
        .supply(this.accounts[1].address, AMOUNT);

      await this.rebalancerTokenContract
        .connect(this.accounts[1])
        .approve(this.manageComp.address, AMOUNT);

      await this.manageComp
        .connect(this.accounts[1])
        .withdraw(this.accounts[1].address, AMOUNT);

      expect(
        await this.wethContract.balanceOf(this.accounts[1].address)
      ).to.be.greaterThan(AMOUNT);

      await this.manageComp.withdraw(this.deployer.address, AMOUNT);
      expect(
        await this.wethContract.balanceOf(this.deployer.address)
      ).to.be.greaterThan(ethers.utils.parseEther("2"));
    });
  });
});
