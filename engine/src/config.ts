import ConfigBase from "commons/configBase.ts"

import { ChainId } from "commons/models/chainId.ts";
import { Exchange } from "commons/models/exchange.ts";

export default class Config extends ConfigBase {

    static MONITOR_INTERVAL: number = parseInt(process.env.MONITOR_INTERVAL || "300000");
    static CHARGE_INTERVAL: number = parseInt(process.env.CHARGE_INTERVAL || "360000");

    static NETWORK: string = process.env.NETWORK || "mainnet";

    static getNetwork(network: string): ChainId {
        switch (network) {
            case "goerli": return ChainId.GOERLI;
            case "sepolia": return ChainId.SEPOLIA;
            case "optimism": return ChainId.OPTIMISM;
            case "mainnet": return ChainId.MAINNET;
        }
        throw new Error(`Unsupported network: ${network}`);
    }

    static NETWORK2: ChainId = Config.getNetwork(Config.NETWORK);

    static EXCHANGE: string = process.env.EXCHANGE || "uniswapv3";

    static getExchange(exchange: string): Exchange {
        switch (exchange) {
            case "uniswapv3": return Exchange.Uniswap;
            case "pancakeswap": return Exchange.PancakeSwap;
            case "sushiswap": return Exchange.SushiSwap;
            case "curve": return Exchange.Curve;
        }
        throw new Error(`Unsupported exchange: ${exchange}`);
    }
    static EXCHANGE2: Exchange = Config.getExchange(Config.EXCHANGE);

    static POOL_COUNT: number = parseInt(process.env.POOL_COUNT || "2000");

    static WS_PORT: number = parseInt(`${process.env.WS_PORT}`);

}