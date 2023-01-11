const chai = require("chai");
const { expect } = chai;
const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const {
  AMOUNT,
  addDaiToAccount,
  deployContract,
} = require("../helpers/testHelper");

this.wethContractAddress = networkConfig[network.config.chainId].WETHToken;
this.daiTokenAddress = networkConfig[network.config.chainId].DAIToken;
this.cDAITokenAddress = networkConfig[network.config.chainId].cDAIToken;

describe("Integration ManageComp contract", () => {
  beforeEach(async () => {
    this.accounts = await ethers.getSigners();
    this.deployer = this.accounts[0];

    this.daiContract = await ethers.getContractAt(
      "IDAI",
      networkConfig[network.config.chainId].DAIToken,
      this.deployer
    );

    //--Deployment--
    this.rebalancerTokenContract = await deployContract("RebalancerToken", [
      "RCompDAI",
      "RCDAI",
      this.cDAITokenAddress,
      this.daiTokenAddress,
    ]);

    this.manageComp = await deployContract("ManageComp", [
      this.cDAITokenAddress,
      this.rebalancerTokenContract.address,
      this.daiTokenAddress,
    ]);

    await this.rebalancerTokenContract.setManageProtocol(
      this.manageComp.address
    );

    //--Change ETH to DAI --
    await addDaiToAccount(this.deployer, AMOUNT);

    this.daiContract = await ethers.getContractAt(
      "IDAI",
      networkConfig[network.config.chainId].DAIToken,
      this.deployer
    );

    this.cDaiContract = await ethers.getContractAt(
      "ICToken",
      networkConfig[network.config.chainId].cDAIToken,
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
      await this.daiContract.approve(this.manageComp.address, AMOUNT);
      await this.manageComp.supply(this.deployer.address, AMOUNT);
    });

    it("Rebalancer Token contract has protocol tokens on a successful supply call", async () => {
      const bal = await this.cDaiContract.balanceOf(
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
      await addDaiToAccount(this.accounts[1], AMOUNT);

      //Supply from accounts[1]
      await this.daiContract
        .connect(this.accounts[1])
        .approve(this.manageComp.address, AMOUNT);
      await this.manageComp
        .connect(this.accounts[1])
        .supply(this.accounts[1].address, AMOUNT);

      bal = await this.rebalancerTokenContract.balanceOf(
        this.accounts[1].address
      );

      expect(bal).to.be.within(1, AMOUNT + 1);
    });
  });

  describe("Withdraw", () => {
    let initBalance;

    beforeEach(async () => {
      initBalance = await this.daiContract.balanceOf(this.deployer.address);
      await this.daiContract.approve(this.manageComp.address, AMOUNT);
      await this.manageComp.supply(this.deployer.address, AMOUNT);

      await this.rebalancerTokenContract.approve(
        this.manageComp.address,
        AMOUNT
      );
    });

    it("caller receives more DAI than the amount supplied upon withdrawal", async () => {
      await this.manageComp.withdraw(this.deployer.address, AMOUNT);
      expect(
        await this.daiContract.balanceOf(this.deployer.address)
      ).to.be.greaterThan(initBalance);
    });

    it("second caller receives more DAI than the amount supplied upon withdrawal", async () => {
      await addDaiToAccount(this.accounts[1], AMOUNT);
      secCallerInitBalance = await this.daiContract.balanceOf(
        this.accounts[1].address
      );

      await this.daiContract
        .connect(this.accounts[1])
        .approve(this.manageComp.address, AMOUNT);
      tx = await this.manageComp
        .connect(this.accounts[1])
        .supply(this.accounts[1].address, AMOUNT);
      await tx.wait(1);

      bal = await this.rebalancerTokenContract.balanceOf(
        this.accounts[1].address
      );

      await this.rebalancerTokenContract
        .connect(this.accounts[1])
        .approve(this.manageComp.address, bal);
      await this.manageComp
        .connect(this.accounts[1])
        .withdraw(this.accounts[1].address, bal);

      expect(
        await this.daiContract.balanceOf(this.accounts[1].address)
      ).to.be.greaterThan(secCallerInitBalance);

      await this.manageComp.withdraw(this.deployer.address, AMOUNT);
      expect(
        await this.daiContract.balanceOf(this.deployer.address)
      ).to.be.greaterThan(initBalance);
    });
  });
});
