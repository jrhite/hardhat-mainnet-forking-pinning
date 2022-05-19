//SPDX-License-Identifier: UNLICENSED
pragma solidity >= 0.6.6 < 0.9.0;

import "hardhat/console.sol";

import "@uniswap/v2-periphery/contracts/UniswapV2Router02.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IERC20.sol";

contract SwapOnUniswap {
    address payable uniswapV2RouterAddr;
    UniswapV2Router02 uniswapV2Router02;

    constructor(address payable _uniswapV2RouterAddr) public {
        uniswapV2RouterAddr = _uniswapV2RouterAddr;
        uniswapV2Router02 = UniswapV2Router02(uniswapV2RouterAddr);
    }
    
    function swap(address tokenIn, uint amountIn) external {
        IERC20 USDC = IERC20(tokenIn);

        require(USDC.transferFrom(msg.sender, address(this), amountIn), "transferFrom failed.");

        require(USDC.approve(uniswapV2RouterAddr, amountIn), "approve failed.");

        // amountOutMin must be retrieved from an oracle of some kind
        address[] memory path = new address[](2);
        path[0] = address(USDC);
        path[1] = uniswapV2Router02.WETH();

        
        uniswapV2Router02.swapExactTokensForETH(amountIn, 100000, path, msg.sender, block.timestamp);
    }
}
