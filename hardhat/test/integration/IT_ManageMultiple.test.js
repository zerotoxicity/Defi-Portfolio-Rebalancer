const chai = require("chai");
const { expect } = chai;
const { ethers, network } = require("hardhat");
const { networkConfig } = require("../../helper-hardhat-config");
const { getAWETHContract } = require("../helpers/aaveHelper");
const {
  getWeth,
  AMOUNT,
  addWETHToAccount,
  getUniswapRouterContract,
  deployContract,
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
    this.rebalancerTokenContract = await deployContract("RebalancerToken", [
      "RCompETH",
      "RCETH",
      this.cETHContractAddress,
      this.wethContractAddress,
    ]);

    //Deploy both lending protocols
    this.manageComp = await deployContract("ManageCompWETH", [
      this.cETHContractAddress,
      this.rebalancerTokenContract.address,
      this.wethContractAddress,
    ]);

    this.manageAave = await deployContract("ManageAave", [
      this.aWethContractAddress,
      this.rebalancerTokenContract.address,
      this.poolProviderAddress,
    ]);
    this.manageProtocolsAddress = [
      this.manageComp.address,
      this.manageAave.address,
    ];

    this.manageProtocols = [this.manageAave, this.manageComp];

    this.manageMultiple = await deployContract("ManageMultiple", [
      this.manageProtocolsAddress,
    ]);

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

  describe("moveToAnotherRebalancer", () => {
    beforeEach(async () => {
      await this.wethContract.approve(this.manageMultiple.address, AMOUNT);
      await this.manageMultiple.supply(this.deployer.address, AMOUNT);
      await this.rebalancerTokenContract.approve(
        this.manageMultiple.address,
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
      this.manageComp2 = await upgrades.deployProxy(
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
      await this.rebalancerTokenContract2.setManageProtocol(
        this.manageComp2.address
      );

      await expect(
        this.manageMultiple.moveToAnotherRebalancer(
          this.manageComp2.address,
          AMOUNT
        )
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

      this.manageComp2 = await deployContract("ManageComp", [
        this.cDAITokenAddress,
        this.rebalancerTokenContract2.address,
        this.daiTokenAddress,
      ]);

      await this.rebalancerTokenContract2.setManageProtocol(
        this.manageComp2.address
      );

      await expect(
        this.manageMultiple.moveToAnotherRebalancer(
          this.manageComp2.address,
          AMOUNT
        )
      ).to.be.reverted;
    });

    it("moves successfully to another Rebalancer", async () => {
      this.rebalancerTokenContract2 = await deployContract("RebalancerToken", [
        "RAaveWETH",
        "RAWETH",
        this.aWethContractAddress,
        this.wethContractAddress,
      ]);

      this.manageAave2 = await deployContract("ManageAave", [
        this.aWethContractAddress,
        this.rebalancerTokenContract2.address,
        this.poolProviderAddress,
      ]);

      await this.rebalancerTokenContract2.setManageProtocol(
        this.manageAave2.address
      );

      await this.manageMultiple.moveToAnotherRebalancer(
        this.manageAave2.address,
        AMOUNT
      );
      expect(
        await this.rebalancerTokenContract2.balanceOf(this.deployer.address)
      ).to.be.greaterThan(0);

      const aWETHContract = await getAWETHContract();

      expect(
        await aWETHContract.balanceOf(this.rebalancerTokenContract2.address)
      ).to.be.greaterThan(0);
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

    describe("setManageProtocol()", () => {
      beforeEach(async () => {
        await this.manageAave.setWrapper(this.manageMultiple.address, true);
        await this.manageComp.setWrapper(this.manageMultiple.address, true);
      });

      it("changes current best", async () => {
        await this.manageMultiple.setManageProtocol([this.manageComp.address]);
        expect(await this.manageMultiple.getCurrentBest()).to.be.equal(
          this.manageComp.address
        );
      });

      it("rebalances when there is more than 1 protocol token is in the contract", async () => {
        await this.manageMultiple.setManageProtocol([this.manageAave.address]);
        await this.wethContract.approve(this.manageMultiple.address, AMOUNT);
        await this.manageMultiple.supply(this.deployer.address, AMOUNT);
        const aWETHContract = await getAWETHContract();
        const cETHToken = await ethers.getContractAt(
          "ICETH",
          networkConfig[network.config.chainId].cETHToken,
          accounts[0]
        );
        //Check the amount of aWETH is above the deposited amount
        expect(
          await aWETHContract.balanceOf(
            await this.manageMultiple.getRebalancerTokenAddress()
          )
        ).to.be.greaterThanOrEqual(AMOUNT);

        expect(
          await cETHToken.balanceOf(
            await this.manageMultiple.getRebalancerTokenAddress()
          )
        ).to.be.equal(0);

        await this.manageMultiple.setManageProtocol([this.manageComp.address]);
        //Confirm the amount of aWETH is zero-ed
        expect(
          await aWETHContract.balanceOf(
            await this.manageMultiple.getRebalancerTokenAddress()
          )
        ).to.be.equal(0);

        expect(
          await cETHToken.balanceOf(
            await this.manageMultiple.getRebalancerTokenAddress()
          )
        ).to.be.greaterThan(0);
      });
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
