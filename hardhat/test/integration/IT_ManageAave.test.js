const chai = require("chai");
const { expect } = chai;
const { ethers, network } = require("hardhat");
const { networkConfig } = require("../../helper-hardhat-config");
const { getWeth, AMOUNT } = require("../helpers/testHelper");
const { getAWETHContract } = require("../helpers/aaveHelper");

this.wethContractAddress = networkConfig[network.config.chainId].WETHToken;
this.aWethContractAddress = networkConfig[network.config.chainId].aWETHToken;
this.poolProviderAddress =
  networkConfig[network.config.chainId].poolAddrProvider;

describe("Integration ManageAave contract", () => {
  beforeEach(async () => {
    this.accounts = await ethers.getSigners();
    this.deployer = this.accounts[0];
    this.wethContract = await getWeth();
    this.aWETHContract = await getAWETHContract();

    //--Deployment--
    const rebalancerTokenContractFactory = await ethers.getContractFactory(
      "RebalancerToken",
      this.deployer
    );
    this.rebalancerTokenContract = await rebalancerTokenContractFactory.deploy(
      "RAaveWETH",
      "RAWETH",
      this.aWethContractAddress,
      this.wethContractAddress
    );

    const manageAaveFactory = await ethers.getContractFactory(
      "ManageAave",
      this.deployer
    );
    this.manageAave = await manageAaveFactory.deploy(
      this.aWethContractAddress,
      this.rebalancerTokenContract.address,
      this.poolProviderAddress
    );

    // --Change ownership of rebalancer token--
    await this.rebalancerTokenContract.transferOwnership(
      this.manageAave.address
    );
  });

  describe("📈 getAPR()", () => {
    it("returns APR of the protocol", async () => {
      expect(await this.manageAave.getAPR()).to.be.greaterThan(0);
    });
  });

  describe("🛠 Supply", () => {
    beforeEach(async () => {
      await this.wethContract.approve(this.manageAave.address, AMOUNT);
      await this.manageAave.supply(this.deployer.address, AMOUNT);
    });

    it("Rebalancer Token contract has protocol tokens on a successful supply call", async () => {
      const bal = await this.aWETHContract.balanceOf(
        this.rebalancerTokenContract.address
      );
      const expectedAmt = bal * (await this.manageAave.getConversionRate());
      expect(expectedAmt).to.be.greaterThan(9 * 1e17);
    });

    it("irst supplier receives 1:1 protocol tokens on a successful supply call", async () => {
      expect(
        await this.rebalancerTokenContract.balanceOf(this.deployer.address)
      ).to.be.equal(AMOUNT);
    });

    it("supplier should receive scaled protocol tokens when protocol tokens>1", async () => {
      //Get 2 WETH into accounts[1]
      const txResponse = await this.wethContract
        .connect(this.accounts[1])
        .deposit({
          value: ethers.utils.parseEther("2"),
        });
      await txResponse.wait(1);

      //Supply from accounts[1]
      await this.wethContract
        .connect(this.accounts[1])
        .approve(this.manageAave.address, AMOUNT);
      await this.manageAave
        .connect(this.accounts[1])
        .supply(this.accounts[1].address, AMOUNT);
      expect(
        await this.rebalancerTokenContract.balanceOf(this.accounts[1].address)
      ).to.be.within(1, AMOUNT);
    });
  });

  describe("Withdraw", () => {
    //Supply first
    beforeEach(async () => {
      await this.wethContract.approve(this.manageAave.address, AMOUNT);
      await this.manageAave.supply(this.deployer.address, AMOUNT);
      await this.rebalancerTokenContract.approve(
        this.manageAave.address,
        AMOUNT
      );
    });

    it("caller receives more WETH than the amount supplied", async () => {
      await this.manageAave.withdraw(this.deployer.address, AMOUNT);
      //Initial WETH is 2, so user should have more than 2 WETH after withdrawing
      expect(
        await this.wethContract.balanceOf(this.deployer.address)
      ).to.be.greaterThan(ethers.utils.parseEther("2"));
    });

    it("second caller receives more WETH than the amount supplied", async () => {
      //Get 2 WETH into accounts[1]
      const txResponse = await this.wethContract
        .connect(this.accounts[1])
        .deposit({
          value: ethers.utils.parseEther("2"),
        });
      await txResponse.wait(1);
      //Supply from accounts[1]
      await this.wethContract
        .connect(this.accounts[1])
        .approve(this.manageAave.address, AMOUNT);
      await this.manageAave
        .connect(this.accounts[1])
        .supply(this.accounts[1].address, AMOUNT);

      //Get balance
      const bal = await this.rebalancerTokenContract.balanceOf(
        this.accounts[1].address
      );
      await this.rebalancerTokenContract
        .connect(this.accounts[1])
        .approve(this.manageAave.address, bal);
      await this.manageAave
        .connect(this.accounts[1])
        .withdraw(this.accounts[1].address, bal);

      expect(
        await this.wethContract.balanceOf(this.accounts[1].address)
      ).to.be.greaterThan(ethers.utils.parseEther("2"));
    });
  });
});
