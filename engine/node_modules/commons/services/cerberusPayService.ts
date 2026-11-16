import { ethers } from "ethers";

import CerberusPay from "./CerberusPay.json" with { type: "json" };

import ConfigBase from "../configBase.js";

const ABI = CerberusPay.abi;

function getProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(ConfigBase.RPC_NODE);
}

function getContract(): ethers.Contract {
    const provider = getProvider();
    return new ethers.Contract(ConfigBase.CEBERRUS_PAY_CONTRACT, ABI, provider);
}

function getSigner(): ethers.Contract {
    const provider = getProvider();
    const signer = new ethers.Wallet(ConfigBase.ADMIN_PRIVATE_KEY, provider);
    return new ethers.Contract(ConfigBase.CEBERRUS_PAY_CONTRACT, ABI, signer);
}

export function getCustomers(): Promise<string[]> {
    return getContract().getFunction("getCustomers")();
}

export function getCustomersNextPayment(customer: string): Promise<number> {
    return getContract().getFunction("payments")(customer);
}

export async function pay(customer: string): Promise<string> {
    const tx: ethers.TransactionResponse = await getSigner().getFunction("pay")(customer);
    await tx.wait();
    return tx.hash;
}