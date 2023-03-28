const chai = require("chai");
const { expect } = chai;
const { ethers, network } = require("hardhat");
const { networkConfig } = require("../../helper-hardhat-config");
const {
  getWeth,
  AMOUNT,
  getUniswapRouterContract,
  deployContract,
} = require("../helpers/testHelper");
const { getAWETHContract } = require("../helpers/aaveHelper");

this.wethContractAddress = networkConfig[network.config.chainId].WETHToken;
this.aWethContractAddress = networkConfig[network.config.chainId].aWETHToken;
this.poolProviderAddress =
  networkConfig[network.config.chainId].poolAddrProvider;

describe("Integration Rebalancer Token contract", () => {
  beforeEach(async () => {
    this.accounts = await ethers.getSigners();
    this.deployer = this.accounts[0];

    this.wethContract = await getWeth();
    this.aWETHContract = await getAWETHContract();

    //--Deployment--

    this.rebalancerTokenContract = await deployContract("RebalancerToken", [
      18,
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

    // --Change ownership of rebalancer token--
    await this.rebalancerTokenContract.setAuthorised(
      this.manageAave.address,
      true
    );

    await this.rebalancerTokenContract.setManageProtocol(
      this.manageAave.address
    );
  });

  describe("🔄 rToPtokenConversionRate", () => {
    it("returns 0 when totalSupply is 0", async () => {
      const routerContract = await getUniswapRouterContract();
      const tx = await routerContract
        .connect(this.deployer)
        .swapExactETHForTokens(
          0,
          [this.wethContractAddress, this.aWethContractAddress],
          this.rebalancerTokenContract.address,
          1703490033,
          { value: AMOUNT }
        );
      await tx.wait(1);

      expect(
        await this.aWETHContract.balanceOf(this.rebalancerTokenContract.address)
      ).to.be.greaterThan(1);

      expect(
        await this.rebalancerTokenContract.rToPtokenConversionRate()
      ).to.be.equal(0);
    });

    it("returns 0 when pTokens is 0", async () => {
      expect(
        await this.rebalancerTokenContract.rToPtokenConversionRate()
      ).to.be.equal(0);
    });
  });

  describe("💵 Withdraw", () => {
    it("burns caller's Rebalancer tokens", async () => {
      await this.wethContract.approve(this.manageAave.address, AMOUNT);
      await this.manageAave.supply(this.deployer.address, AMOUNT);
      await this.rebalancerTokenContract.approve(
        this.manageAave.address,
        AMOUNT
      );

      await this.manageAave.withdraw(this.deployer.address, AMOUNT);
      expect(
        await this.rebalancerTokenContract.balanceOf(this.deployer.address)
      ).to.be.equal(0);
    });
  });
});
