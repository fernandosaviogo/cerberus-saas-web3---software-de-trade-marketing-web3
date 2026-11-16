import { ChainId } from "./chainId.js";

export type Token = {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    network: ChainId;
}