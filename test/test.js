const { expect } = require("chai");
const { ethers } = require("hardhat");

const USER_ADDRESS = "0xfe78Fa483dABa058C02db8506636bf247773D605";

const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const USDC_TOKEN_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

describe("SwapOnUniswap", function () {
  let deployerSigner, userSigner;

  let usdcToken;
  let usdcTokenBalance;

  let swapOnUniswap;

  async function logBalances(accountAddr, tokenAddr) {
    const token = await ethers.getContractAt("IERC20", tokenAddr);
    const tokenSymbol = await token.symbol()
    const tokenDecimals = await token.decimals();
    const tokenBalance = await token.balanceOf(accountAddr);

    console.log(`account addr = ${accountAddr}`);
    console.log(`ETH balance = ${ethers.utils.formatEther(await ethers.provider.getBalance(accountAddr))}`);
    console.log(`${tokenSymbol} balance = ${ethers.utils.formatUnits(tokenBalance, tokenDecimals)}`);
  }

  before(async function () {
    [deployerSigner] = await ethers.getSigners();

    usdcToken = await ethers.getContractAt("IERC20", USDC_TOKEN_ADDRESS);
    usdcTokenBalance = await usdcToken.balanceOf(USER_ADDRESS);
    
    const SwapOnUniswap = await ethers.getContractFactory("SwapOnUniswap");
    swapOnUniswap = await SwapOnUniswap.deploy(UNISWAP_V2_ROUTER);
    await swapOnUniswap.deployed();

    console.log(`=======================`);
    console.log(`SwapOnUniswap deployed to address: ${swapOnUniswap.address}`);
    console.log(`=======================\n`);
  });

  before(async function() {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USER_ADDRESS],
    });

    // impersonate account holding lots of ETH
    userSigner = await ethers.provider.getSigner(USER_ADDRESS);

    swapOnUniswap = await swapOnUniswap.connect(userSigner);
    usdcToken = await usdcToken.connect(userSigner);

    const approveTxn = await usdcToken.approve(swapOnUniswap.address, usdcTokenBalance);
    await approveTxn.wait();

    console.log(`=======================`);
    console.log("balances before swap");
    await logBalances(USER_ADDRESS, USDC_TOKEN_ADDRESS);
    console.log(`=======================\n`);
  });

  after(async function () {
    console.log("balances after swap");
    console.log(`=======================`);
    await logBalances(USER_ADDRESS, USDC_TOKEN_ADDRESS);
    console.log(`=======================\n`);

    await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [USER_ADDRESS],
    });

    swapOnUniswap = await swapOnUniswap.connect(deployerSigner);
  });

  it("Should swap USDC for ETH on Uniswap", async function () {
    const swapTxn = await swapOnUniswap.swap(USDC_TOKEN_ADDRESS, usdcTokenBalance);

    //const swapTxnReceipt = await swapTxn.wait();
  });
});
