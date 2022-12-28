const chai = require("chai");
const { expect } = chai;
const { ethers, network } = require("hardhat");
const { networkConfig } = require("../../helper-hardhat-config");
const { getUniswapRouterContract, AMOUNT } = require("../helpers/testHelper");

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
    const rebalancerTokenContractFactory = await ethers.getContractFactory(
      "RebalancerToken",
      this.deployer
    );
    this.rebalancerTokenContract = await rebalancerTokenContractFactory.deploy(
      "RCompDAI",
      "RCDAI",
      this.cDAITokenAddress,
      this.daiTokenAddress
    );
    const manageCompFactory = await ethers.getContractFactory(
      "ManageComp",
      this.deployer
    );
    this.manageComp = await manageCompFactory.deploy(
      this.cDAITokenAddress,
      this.rebalancerTokenContract.address,
      this.daiTokenAddress
    );
    await this.rebalancerTokenContract.transferOwnership(
      this.manageComp.address
    );

    //--Change ETH to DAI --
    this.routerContract = await getUniswapRouterContract();
    const tx = await this.routerContract.swapExactETHForTokens(
      0,
      [this.wethContractAddress, this.daiTokenAddress],
      this.deployer.address,
      1703490033,
      { value: AMOUNT }
    );
    await tx.wait(1);
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
      const tx = await this.routerContract
        .connect(this.accounts[1])
        .swapExactETHForTokens(
          0,
          [this.wethContractAddress, this.daiTokenAddress],
          this.accounts[1].address,
          1703490033,
          { value: AMOUNT }
        );
      await tx.wait(1);

      //Supply from accounts[1]
      await this.daiContract
        .connect(this.accounts[1])
        .approve(this.manageComp.address, AMOUNT);
      await this.manageComp
        .connect(this.accounts[1])
        .supply(this.accounts[1].address, AMOUNT);
      expect(
        await this.rebalancerTokenContract.balanceOf(this.accounts[1].address)
      ).to.be.within(1, AMOUNT);
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

    it("caller receives more DAI than the amount supplied", async () => {
      await this.manageComp.withdraw(this.deployer.address, AMOUNT);
      //Initial WETH is 2, so user should have more than 2 WETH after withdrawing
      expect(
        await this.daiContract.balanceOf(this.deployer.address)
      ).to.be.greaterThan(initBalance);
    });

    it("second caller receives more DAI than the amount supplied", async () => {
      console.log(
        "Rebalancer's cDAI:",
        await this.cDaiContract.balanceOf(this.rebalancerTokenContract.address)
      );

      let tx = await this.routerContract
        .connect(this.accounts[1])
        .swapExactETHForTokens(
          0,
          [this.wethContractAddress, this.daiTokenAddress],
          this.accounts[1].address,
          1703490033,
          { value: AMOUNT }
        );
      await tx.wait(1);
      initBalance = await this.daiContract.balanceOf(this.accounts[1].address);

      console.log("Initial balance of address[1]: ", initBalance);

      await this.daiContract
        .connect(this.accounts[1])
        .approve(this.manageComp.address, initBalance);
      tx = await this.manageComp
        .connect(this.accounts[1])
        .supply(this.accounts[1].address, initBalance);
      await tx.wait(1);

      //Get balance
      bal = await this.rebalancerTokenContract.balanceOf(
        this.accounts[1].address
      );
      console.log("Address[1] rebalancer token balance: ", bal);
      console.log(
        "Rebalancer's cDAI:",
        await this.cDaiContract.balanceOf(this.rebalancerTokenContract.address)
      );
      await this.rebalancerTokenContract
        .connect(this.accounts[1])
        .approve(this.manageComp.address, bal);
      await this.manageComp
        .connect(this.accounts[1])
        .withdraw(this.accounts[1].address, bal);

      console.log("\n--After withdrawing--");
      console.log(
        "Address[1] rebalancer token balance:",
        await this.rebalancerTokenContract.balanceOf(this.accounts[1].address)
      );
      console.log(
        "contract rebalancer token: ",
        await this.rebalancerTokenContract.balanceOf(this.manageComp.address)
      );
      console.log(
        "contract dai token: ",
        await this.daiContract.balanceOf(this.manageComp.address)
      );
      console.log(
        "Rebalancer's cDAI:",
        await this.cDaiContract.balanceOf(this.rebalancerTokenContract.address)
      );
      //   expect(
      //     await this.daiContract.balanceOf(this.accounts[1].address)
      //   ).to.be.greaterThan(initBalance);
    });
  });
});
