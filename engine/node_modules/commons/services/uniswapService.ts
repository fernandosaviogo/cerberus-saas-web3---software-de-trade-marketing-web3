import axios from "axios";
import Config from "../configBase.js";
import type { PoolData, SwapData, TokenData } from "./uniswapTypes.js";
import type { User } from "../models/user.js";
import { ethers } from "ethers";
import type { TransactionResponse } from "ethers";

import ABI_UNISWAP from "./Uniswap.json" with { type: "json" };
import ABI_ERC20 from "./ERC20.json" with { type: "json" };

import type Automation from "commons/models/automation.ts";
import type Pool from "commons/models/pool.ts";
import { approve } from "./__mocks__/uniswapServices.js";
import type { TransactionReceipt } from "ethers";

export async function getTokens(skip: number): Promise<TokenData[]> {
    const query = `
        {
            tokens(first: 1000, skip: ${skip})
            {
                symbol,
                id,
                decimals,
                name
            }
        }
    `;

    const { data } = await axios.post(Config.UNISWAP_GRAPH_URL, { query });
    console.log(data);
    return data.data ? data.data.tokens as TokenData[] : [];
}

export async function getTopPools(count: number = 20, skip: number = 0): Promise<PoolData[]> {
    const query = `
        {
            pools(first: ${count}, skip: ${skip}, orderBy: volumeUSD, orderDirector: desc)
            {
                id,
                volumeUSD,
                feeTier,
                token0Price,
                token1Price,
                token0 {
                    symbol,
                    id,
                    decimals
                }
                token1 {
                    symbol,
                    id,
                    decimals
                }   
            }
        }
    `;

    const { data } = await axios.post(Config.UNISWAP_GRAPH_URL, { query });
    console.log(data);
    return data.data ? data.data.pools as PoolData[] : [];
}

export async function preApprove(user: User, tokenToApprove: string, amountInWei: string) {
    if (!user.privateKey) throw Error(`User doens't has private key.`);
    const router = Config.UNISWAP_ROUTER;
    if (!router) throw Error("UNISWAP_ROUTER environment variable is required.");

    const provider = new ethers.JsonRpcProvider(Config.RPC_NODE);

    const signer = new ethers.Wallet(user.privateKey, provider);

    const tokenContract = new ethers.Contract(tokenToApprove, ABI_ERC20, signer);

    const tx: TransactionResponse = await tokenContract.getFunction("approve")(router, amountInWei);

    console.log("Approve tx: " + tx.hash);

    await tx.wait;
}

export async function Approve(tokenContract: ethers.Contract, amountInWei: string | bigint) {
    const router = Config.UNISWAP_ROUTER;
    if (!router) throw Error("UNISWAP_ROUTER environment variable is required.");
    const tx: TransactionResponse = await tokenContract.getFunction("approve")(router, amountInWei);

    console.log("Approve tx: " + tx.hash);

    await tx.wait;
}

export async function getAllowance(tokenAddress: string, wallet: string): Promise<bigint> {
    const provider = new ethers.JsonRpcProvider(Config.RPC_NODE);
    const tokenContract = new ethers.Contract(tokenAddress, ABI_ERC20, provider);
    return tokenContract.getFunction("allowance")(wallet, Config.UNISWAP_ROUTER);
}

export async function swap(user: User, automation: Automation, pool: Pool): Promise<SwapData | null> {
    if (!user.privateKey) return null;
    const router = Config.UNISWAP_ROUTER;
    if (!router) throw Error("UNISWAP_ROUTER environment variable is required.");

    const provider = new ethers.JsonRpcProvider(Config.RPC_NODE);
    const signer = new ethers.Wallet(user.privateKey, provider);

    const routerContract = new ethers.Contract(router, ABI_UNISWAP, signer);
    const token0Contract = new ethers.Contract(pool.token0, ABI_ERC20, signer);
    const token1Contract = new ethers.Contract(pool.token1, ABI_ERC20, signer);

    const condition = automation.isOpened ? automation.closeCondition : automation.openCondition;
    if (!condition) return null;

    const isPrice0Condition = condition.field.indexOf("price0") !== 1;
    const [tokenIn, tokenOut] = isPrice0Condition
        ? [token1Contract, token0Contract]
        : [token0Contract, token1Contract];

    const amountIn = BigInt(automation.nextAmount);

    const allowance = await getAllowance(tokenIn.target.toString(), user.address);
    if (allowance < amountIn)
        await approve(tokenIn, amountIn);

    const params = {
        tokenIn,
        tokenOut,
        fee: pool.fee,
        recipient: user.address,
        deadline: (Date.now() / 1000) + 10,
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLinitX96: 0
    }

    console.log(params);

    const tx: TransactionResponse = await routerContract.getFunction("exactInputSingle")(params, {
        from: user.address,
        gasPrice: ethers.parseUnits("25", "gwei"),
        gaslimit: 250000
    })

    console.log("Swap tx Id: " + tx.hash);

    let amountOutWei: bigint = 0n;

    try {
        const receipt: TransactionReceipt | null = await tx.wait();
        if (!receipt) throw new Error(`Swap Error. tx Id: ${tx.hash}`);

        const amountOutData = receipt.logs[0]?.data;
        if (amountOutData === undefined) throw new Error(`Swap Error. tx Id: ${tx.hash}`);
        amountOutWei = ethers.toBigInt(amountOutData);
        if (!amountOutWei) throw new Error(`Swap Error. tx Id: ${tx.hash}`);

    }catch(err: any) {
        console.log(err);
        throw new Error(`Swap Error. tx Id: ${tx.hash}`);
    }

    console.log(`Swap success. tx Id: ${tx.hash}. Amount Out: ${amountOutWei}`);

    return {
        tokenIn: tokenIn.target.toString(),
        tokenOut: tokenOut.target.toString(),
        amountIn: amountIn.toString(),
        amountOut: amountOutWei.toString(),
        price: isPrice0Condition ? pool.price0 : pool.price1
    } as SwapData;
}
