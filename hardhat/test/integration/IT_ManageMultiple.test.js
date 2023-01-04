const chai = require("chai");
const { expect } = chai;
const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { getAWETHContract } = require("../helpers/aaveHelper");
const {
  getWeth,
  AMOUNT,
  addWETHToAccount,
  getUniswapRouterContract,
} = require("../helpers/testHelper");

this.wethContractAddress = networkConfig[network.config.chainId].WETHToken;
this.cETHContractAddress = networkConfig[network.config.chainId].cETHToken;
this.aWethContractAddress = networkConfig[network.config.chainId].aWETHToken;
this.poolProviderAddress =
  networkConfig[network.config.chainId].poolAddrProvider;

describe("Integration Test ManageMultiple Contract", () => {
  beforeEach(async () => {
    this.accounts = await ethers.getSigners();
    this.deployer = this.accounts[0];
    this.wethContract = await getWeth();

    //--Deployment--
    const rebalancerTokenContractFactory = await ethers.getContractFactory(
      "RebalancerToken",
      this.deployer
    );

    this.rebalancerTokenContract = await rebalancerTokenContractFactory.deploy(
      "RCompETH",
      "RCETH",
      this.cETHContractAddress,
      this.wethContractAddress
    );

    //Deploy both lending protocols
    const manageCompFactory = await ethers.getContractFactory(
      "ManageCompWETH",
      this.deployer
    );

    this.manageComp = await manageCompFactory.deploy(
      this.cETHContractAddress,
      this.rebalancerTokenContract.address,
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
    this.manageProtocolsAddress = [
      this.manageComp.address,
      this.manageAave.address,
    ];

    this.manageProtocols = [this.manageAave, this.manageComp];

    const manageMultipleFactory = await ethers.getContractFactory(
      "ManageMultiple",
      this.deployer
    );

    this.manageMultiple = await manageMultipleFactory.deploy(
      this.manageProtocolsAddress
    );

    const allProtocols = [...this.manageProtocols, this.manageMultiple];
    for (const protocols of allProtocols) {
      await this.rebalancerTokenContract.setAuthorised(protocols.address, true);
    }

    await this.rebalancerTokenContract.setManageProtocol(
      this.manageMultiple.address
    );
  });

  describe("📈 getAPR()", () => {
    it("returns APR of the best protocol", async () => {
      expect(await this.manageMultiple.getAPR()).to.be.greaterThan(0);
    });

    it("is retrieving the current best protocol", async () => {
      const manageArr = [];

      for (const protocols of this.manageProtocols) {
        apr = await protocols.getAPR();
        manageArr.push(apr);
      }
      let bestAPR = Math.max(...manageArr);

      expect(await this.manageMultiple.getAPR()).to.be.within(
        BigInt(bestAPR - 100),
        BigInt(bestAPR + 100)
      );
    });
  });

  describe("🛠 Supply", async () => {
    beforeEach(async () => {
      await this.wethContract.approve(this.manageMultiple.address, AMOUNT);
      await this.manageMultiple.supply(this.deployer.address, AMOUNT);
      const currentBestAddr = await this.manageMultiple.getCurrentBest();

      for (const protocol of this.manageProtocols) {
        if (currentBestAddr == protocol.address) {
          this.pTokenContract = await ethers.getContractAt(
            "IERC20",
            await protocol.getpToken(),
            this.deployer
          );
          break;
        }
      }
    });

    it("Rebalancer Token contract has protocol tokens on a successful supply call", async () => {
      const bal = await this.pTokenContract.balanceOf(
        this.rebalancerTokenContract.address
      );
      const expectedAmt = bal * (await this.manageMultiple.getConversionRate());
      expect(expectedAmt).to.be.greaterThan(9 * 1e17);
    });

    it("first supplier receives 1:1 protocol tokens on a successful supply call", async () => {
      expect(
        await this.rebalancerTokenContract.balanceOf(this.deployer.address)
      ).to.be.equal(AMOUNT);
    });

    it("supplier should receive scaled protocol tokens when protocol tokens>1", async () => {
      //Get 2 WETH into accounts[1]
      await addWETHToAccount(this.accounts[1], ethers.utils.parseEther("2"));

      //Supply from accounts[1]
      await this.wethContract
        .connect(this.accounts[1])
        .approve(this.manageMultiple.address, AMOUNT);

      await this.manageMultiple
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
      await this.wethContract.approve(this.manageMultiple.address, AMOUNT);
      await this.manageMultiple.supply(this.deployer.address, AMOUNT);
      await this.rebalancerTokenContract.approve(
        this.manageMultiple.address,
        AMOUNT
      );
      const currentBestAddr = await this.manageMultiple.getCurrentBest();

      for (const protocol of this.manageProtocols) {
        if (currentBestAddr == protocol.address) {
          this.pTokenContract = await ethers.getContractAt(
            "IERC20",
            await protocol.getpToken(),
            this.deployer
          );
          break;
        }
      }
    });

    it("caller receives more WETH than the amount supplied upon withdrawal", async () => {
      await this.manageMultiple.withdraw(this.deployer.address, AMOUNT);
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
        .approve(this.manageMultiple.address, ethers.utils.parseEther("10"));
      await this.manageMultiple
        .connect(this.accounts[1])
        .supply(this.accounts[1].address, ethers.utils.parseEther("10"));

      //Get balance
      const bal = await this.rebalancerTokenContract.balanceOf(
        this.accounts[1].address
      );
      await this.rebalancerTokenContract
        .connect(this.accounts[1])
        .approve(this.manageMultiple.address, bal);

      await this.manageMultiple
        .connect(this.accounts[1])
        .withdraw(this.accounts[1].address, bal);

      expect(
        await this.wethContract.balanceOf(this.accounts[1].address)
      ).to.be.greaterThan(ethers.utils.parseEther("10"));

      //Caller 1 withdraws
      await this.manageMultiple.withdraw(this.deployer.address, AMOUNT);
      //Initial WETH is 2, so user should have more than 2 WETH after withdrawing
      expect(
        await this.wethContract.balanceOf(this.deployer.address)
      ).to.be.greaterThan(ethers.utils.parseEther("2"));
    });
  });

  describe("ALendingProtocol", () => {
    it("reverts when not called by owner", async () => {
      await expect(
        this.manageAave
          .connect(this.accounts[1])
          .setWrapper(this.manageMultiple.address, true)
      ).to.be.reverted;
    });
    it("set wrapper when called by owner", async () => {
      await this.manageAave.setWrapper(this.manageMultiple.address, true);
      expect(
        await this.manageAave.getWrapper(this.manageMultiple.address)
      ).to.be.equal(true);
    });

    describe("rebalancingSupply()", () => {
      beforeEach(async () => {
        for (const protocol of this.manageProtocols) {
          await protocol.setWrapper(this.manageMultiple.address, true);
        }
      });

      it("reverts when not called by the wrapper", async () => {
        await expect(
          this.manageAave.connect(this.accounts[1]).rebalancingSupply()
        ).to.be.reverted;
      });

      it("success when called by the wrapper", async () => {
        const aWETHContract = await getAWETHContract();

        await this.wethContract.transfer(this.manageAave.address, AMOUNT);

        await this.manageAave.rebalancingSupply();
        expect(
          await aWETHContract.balanceOf(this.rebalancerTokenContract.address)
        ).to.be.greaterThan(1);
      });
    });

    describe("rebalancingWithdraw()", () => {
      beforeEach(async () => {
        for (const protocol of this.manageProtocols) {
          await protocol.setWrapper(this.manageMultiple.address, true);
        }
      });

      it("reverts when not called by the wrapper(ManageMultiple)", async () => {
        await expect(
          this.manageAave
            .connect(this.accounts[1])
            .rebalancingWithdraw(this.manageComp.address)
        ).to.be.reverted;
      });

      it("success when called by the wrapper", async () => {
        const routerContract = await getUniswapRouterContract();
        const tx = await routerContract
          .connect(this.deployer)
          .swapExactETHForTokens(
            0,
            [this.wethContractAddress, this.aWethContractAddress],
            this.manageAave.address,
            1703490033,
            { value: AMOUNT }
          );
        await tx.wait(1);
        const aWETHContract = await getAWETHContract();

        expect(
          await aWETHContract.balanceOf(this.manageAave.address)
        ).to.be.greaterThan(1);

        await this.manageAave.rebalancingWithdraw(this.manageComp.address);

        expect(
          await aWETHContract.balanceOf(this.manageAave.address)
        ).to.be.equal(0);

        expect(
          await this.wethContract.balanceOf(this.manageComp.address)
        ).to.be.greaterThan(0);
      });
    });
  });
});
