import { JWT } from "commons/models/jwt";
import ConfigService from "./ConfigService";
import { BrowserProvider } from "ethers";
import { Plan } from "commons/models/plan";
import ERC20_ABI from "commons/services/ERC20.json"
import { Contract, InterfaceAbi } from "ethers";
import { parseJwt, signIn } from "./AuthService";
import type { Auth } from "./AuthService";

function getProvider() {

    if(!window.ethereum) throw new Error("MetaMask is not installed. Please install MetaMask and try again.");

    return new BrowserProvider(window.ethereum);
}

export async function getWallet(): Promise<string> {
    const provider = getProvider();
    const accouints = await provider.send("eth_requestAccounts", []);

    if(!accouints || accouints.length === 0) throw new Error("No accounts found. Please connect your MetaMask wallet and try again.");

    const wallet = accouints[0];
    localStorage.setItem("wallet", wallet);

    return wallet;
}

export async function doLogin(): Promise<JWT | undefined> {

    const timestamp = Date.now();
    const message = ConfigService.getAuthMsg();
    const wallet = await getWallet();
    const provider = getProvider();
    const signer = await provider.getSigner();

    const challenge = await signer.signMessage(message);

    const token = await signIn({
        secret: challenge,
        timestamp,
        wallet
    } as Auth);

    localStorage.setItem("token", token);
    console.log(token);

    return parseJwt(token);
}

export async function startPayment(plan: Plan) : Promise<boolean> {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const tokenContract = new Contract(plan.tokenAddress, ERC20_ABI as InterfaceAbi, signer);
    const tx = await tokenContract.approve(ConfigService.CERBERUS_PAY_CONTRACT, BigInt(plan.price) * 12n)
    await tx.wait();
    return true;
}