const chai = require("chai");
const { expect } = chai;
const { ethers, network } = require("hardhat");
const { networkConfig } = require("../../helper-hardhat-config");
const {
  getWeth,
  AMOUNT,
  addWETHToAccount,
  deployContract,
} = require("../helpers/testHelper");
const { getAWETHContract } = require("../helpers/aaveHelper");

this.cETHContractAddress = networkConfig[network.config.chainId].cETHToken;
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

    this.rebalancerTokenContract = await deployContract("RebalancerToken", [
      "RAaveWETH",
      "RAWETH",
      this.aWethContractAddress,
      this.wethContractAddress,
    ]);

    this.manageAave = await deployContract("ManageAave", [
      this.aWethContractAddress,
      this.rebalancerTokenContract.address,
      this.poolProviderAddress,
    ]);

    await this.rebalancerTokenContract.setManageProtocol(
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

    it("Rebalancer Token contract has Rebalancer tokens on a successful supply call", async () => {
      const bal = await this.aWETHContract.balanceOf(
        this.rebalancerTokenContract.address
      );
      const expectedAmt = bal * (await this.manageAave.getConversionRate());
      expect(expectedAmt).to.be.greaterThan(9 * 1e17);
    });

    it("first supplier receives 1:1 Rebalancer tokens on a successful supply call", async () => {
      expect(
        await this.rebalancerTokenContract.balanceOf(this.deployer.address)
      ).to.be.equal(AMOUNT);
    });

    it("supplier should receive scaled Rebalancer tokens when protocol tokens>1", async () => {
      //Get 2 WETH into accounts[1]
      await addWETHToAccount(this.accounts[1], ethers.utils.parseEther("2"));

      //Supply from accounts[1]
      await this.wethContract
        .connect(this.accounts[1])
        .approve(this.manageAave.address, AMOUNT);
      await this.manageAave
        .connect(this.accounts[1])
        .supply(this.accounts[1].address, AMOUNT);

      const bal = await this.rebalancerTokenContract.balanceOf(
        this.accounts[1].address
      );

      expect(bal).to.be.within(1, AMOUNT + 1);
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

    it("caller receives more WETH than the amount supplied upon withdrawal", async () => {
      await this.manageAave.withdraw(this.deployer.address, AMOUNT);
      //Initial WETH is 2, so user should have more than 2 WETH after withdrawing
      expect(
        await this.wethContract.balanceOf(this.deployer.address)
      ).to.be.greaterThan(ethers.utils.parseEther("2"));
    });

    it("second caller receives more WETH than the amount supplied upon withdrawal", async () => {
      //Get 2 WETH into accounts[1]
      await addWETHToAccount(this.accounts[1], ethers.utils.parseEther("10"));

      //Supply from accounts[1]
      await this.wethContract
        .connect(this.accounts[1])
        .approve(this.manageAave.address, ethers.utils.parseEther("10"));
      await this.manageAave
        .connect(this.accounts[1])
        .supply(this.accounts[1].address, ethers.utils.parseEther("10"));

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
      ).to.be.greaterThan(ethers.utils.parseEther("10"));

      //Caller 1 withdraws
      await this.manageAave.withdraw(this.deployer.address, AMOUNT);
      //Initial WETH is 2, so user should have more than 2 WETH after withdrawing
      expect(
        await this.wethContract.balanceOf(this.deployer.address)
      ).to.be.greaterThan(ethers.utils.parseEther("2"));
    });
  });

  describe("moveToAnotherRebalancer", () => {
    beforeEach(async () => {
      await this.wethContract.approve(this.manageAave.address, AMOUNT);
      await this.manageAave.supply(this.deployer.address, AMOUNT);
      await this.rebalancerTokenContract.approve(
        this.manageAave.address,
        AMOUNT
      );
    });

    it("fails when it is not deployed by the same owner", async () => {
      this.rebalancerTokenContract2 = await deployContract("RebalancerToken", [
        "RCompETH",
        "RCETH",
        this.cETHContractAddress,
        this.wethContractAddress,
      ]);

      const contractFactory = await ethers.getContractFactory(
        "ManageCompWETH",
        this.accounts[1]
      );
      this.manageComp = await upgrades.deployProxy(
        contractFactory,
        [
          this.cETHContractAddress,
          this.rebalancerTokenContract2.address,
          this.wethContractAddress,
        ],
        {
          kind: "uups",
        }
      );
      await this.rebalancerTokenContract2.setAuthorised(
        this.manageComp.address,
        true
      );

      await expect(
        this.manageAave.moveToAnotherRebalancer(this.manageComp.address, AMOUNT)
      ).to.be.reverted;
    });

    it("fails when the other rebalancer is of another asset", async () => {
      this.daiTokenAddress = networkConfig[network.config.chainId].DAIToken;
      this.cDAITokenAddress = networkConfig[network.config.chainId].cDAIToken;

      this.rebalancerTokenContract2 = await deployContract("RebalancerToken", [
        "RCompDAI",
        "RCDAI",
        this.cDAITokenAddress,
        this.daiTokenAddress,
      ]);

      this.manageComp = await deployContract("ManageComp", [
        this.cDAITokenAddress,
        this.rebalancerTokenContract2.address,
        this.daiTokenAddress,
      ]);

      await this.rebalancerTokenContract.setManageProtocol(
        this.manageComp.address
      );

      await expect(
        this.manageAave.moveToAnotherRebalancer(this.manageComp.address, AMOUNT)
      ).to.be.reverted;
    });

    it("moves successfully to another Rebalancer", async () => {
      this.rebalancerTokenContract2 = await deployContract("RebalancerToken", [
        "RCompETH",
        "RCETH",
        this.cETHContractAddress,
        this.wethContractAddress,
      ]);
      this.manageComp = await deployContract("ManageCompWETH", [
        this.cETHContractAddress,
        this.rebalancerTokenContract2.address,
        this.wethContractAddress,
      ]);

      await this.rebalancerTokenContract2.setManageProtocol(
        this.manageComp.address
      );

      this.cETHContract = await ethers.getContractAt(
        "ICETH",
        this.cETHContractAddress,
        this.deployer
      );

      await this.rebalancerTokenContract2.setManageProtocol(
        this.manageComp.address
      );

      await this.manageAave.moveToAnotherRebalancer(
        this.manageComp.address,
        AMOUNT
      );
      expect(
        await this.rebalancerTokenContract.balanceOf(this.deployer.address)
      ).to.be.equal(0);
      expect(
        await this.rebalancerTokenContract2.balanceOf(this.deployer.address)
      ).to.be.greaterThan(0);
      expect(
        await this.cETHContract.balanceOf(this.rebalancerTokenContract2.address)
      ).to.be.greaterThan(0);
    });
  });
});
