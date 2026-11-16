import { ChainId } from "./chainId.js";
import { Exchange } from "./exchange.js";

export type Condition = {
    field: string;
    operator: string;
    value: string;
}

export default class Automation {
    id?: string;
    userId: string;
    name: string;
    exchange: Exchange;
    network: ChainId;
    poolId: string | null;
    openCondition: Condition;
    closeCondition: Condition | null;
    isOpened: boolean;
    isActive: boolean;
    nextAmount: string;
    pnl?: number;
    tradeCount?: number;

    constructor(automation: Automation) {
        if (automation.id !== undefined) {
            this.id = automation.id;
        }
        this.userId = automation.userId;
        this.exchange = automation.exchange || Exchange.Uniswap;
        this.network = automation.network || ChainId.MAINNET;
        this.name = automation.name;
        this.poolId = automation.poolId;
        this.openCondition = automation.openCondition;
        this.closeCondition = automation.closeCondition;
        this.isOpened = automation.isOpened === true;
        this.isActive = automation.isOpened === true;
        this.nextAmount = automation.nextAmount;
        if (automation.pnl !== undefined) {
            this.pnl = automation.pnl;
        }
        if (automation.tradeCount !== undefined) {
            this.tradeCount = automation.tradeCount;
        }
    }
}
