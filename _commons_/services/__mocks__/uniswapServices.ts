import { ethers } from "ethers";
import type { User } from "../../models/user.ts";

export async function preApprove(user: User, tokenToApprove: string, amountInEth: string): Promise<string> {
    return Promise.resolve("0x123");
}

export async function approve(tokenContract: ethers.Contract, amountInEth: string | bigint): Promise<string> {
    return Promise.resolve("0x123");
}

export async function getAllowance(tokenAddress: string, wallet: string): Promise<bigint> {
    return Promise.resolve(0n);
}