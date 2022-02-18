const { expect } = require("chai");
const { ethers } = require("hardhat");

const USER_ADDRESS = "0xfe78Fa483dABa058C02db8506636bf247773D605";

const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const USDC_TOKEN_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

describe("SwapOnUniswap", function () {
  let deployerSigner, userSigner;

  let usdcToken;
  let usdcSwapAmount = ethers.BigNumber.from("101354472905");

  let swapOnUniswap;

  before(async function () {
    [deployerSigner] = await ethers.getSigners();

    usdcToken = await ethers.getContractAt("IERC20", USDC_TOKEN_ADDRESS);
    
    const SwapOnUniswap = await ethers.getContractFactory("SwapOnUniswap");
    swapOnUniswap = await SwapOnUniswap.deploy(
      UNISWAP_V2_ROUTER
    );
    await swapOnUniswap.deployed();

    console.log(`=======================`);
    console.log(`SwapOnUniswap deployed to address: ${swapOnUniswap.address}`);
    console.log(`=======================\n`);
  });

  before(async function() {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USER_ADDRESS],
    });

    // impersonate account holding lots of WETH
    userSigner = await ethers.provider.getSigner(USER_ADDRESS);

    swapOnUniswap = await swapOnUniswap.connect(userSigner);
    usdcToken = await usdcToken.connect(userSigner);

    const approveTxn = await usdcToken.approve(swapOnUniswap.address, usdcSwapAmount);
    await approveTxn.wait();

    console.log(`=======================`);
    console.log("balances before swap");
    await swapOnUniswap.logBalances(USDC_TOKEN_ADDRESS);
    console.log(`=======================\n`);
  });

  after(async function () {
    console.log("balances after swap");
    console.log(`=======================`);
    await swapOnUniswap.logBalances(USDC_TOKEN_ADDRESS);
    console.log(`=======================\n`);

    await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [USER_ADDRESS],
    });

    swapOnUniswap = await swapOnUniswap.connect(deployerSigner);
  });

  it("Should swap WETH for DAI on Uniswap", async function () {
    const swapTxn = await swapOnUniswap.swap(USDC_TOKEN_ADDRESS, usdcSwapAmount);

    const swapTxnReceipt = await swapTxn.wait();
    
    // console.log({ swapTxnReceipt });
  });
});
