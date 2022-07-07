const { expect } = require("chai");
const { FakeContract, smock } = require("@defi-wonderland/smock");
const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

describe("📝 ManageAAVE Contract", function () {
  let manageAave;
  let aWeth = networkConfig[network.config.chainId].aWethToken;
  let wethToken = networkConfig[network.config.chainId].wethToken;
  let addressProvider =
    networkConfig[network.config.chainId].aaveLendingPoolAddressesProvider;
  let erc20Mock;
  let aERC20Mock;
  let lendingPoolProviderMock;
  let lendingPoolMock;

  beforeEach(async function () {
    const deployer = await getNamedAccounts().deployer;

    //Create fakes
    erc20Mock = await smock.fake("IERC20", { address: wethToken });
    aERC20Mock = await smock.fake("IAToken", { address: aWeth });
    lendingPoolProviderMock = await smock.fake("ILendingPoolAddressesProvider");
    lendingPoolMock = await smock.fake("ILendingPool");

    aERC20Mock.UNDERLYING_ASSET_ADDRESS.returns(aWeth);
    lendingPoolProviderMock.getLendingPool.returns(lendingPoolMock.address);

    const manageAaveFactory = await smock.mock("ManageAave");
    manageAave = await manageAaveFactory.deploy();
    await manageAave.init(aWeth, lendingPoolProviderMock.address);
  });

  // it("💬 Underlying asset address should be consistent", async function () {
  //   expect(await manageAave.asset()).to.equal(
  //     networkConfig[network.config.chainId].wethToken
  //   );
  // });

  it("Supply successfully", async function () {
    erc20Mock.balanceOf.returns(ethers.utils.parseEther("1"));
    erc20Mock.transfer.returns(true);
    erc20Mock.allowance.returns(ethers.utils.parseEther("1"));
    await manageAave.supply();
    // const balance = await erc20Mock.balanceOf(manageAave.address);
    // console.log(ethers.utils.formatEther(balance).toString());
  });
});
