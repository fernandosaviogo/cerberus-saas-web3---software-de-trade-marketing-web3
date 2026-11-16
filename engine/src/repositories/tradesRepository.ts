import Trade from "commons/models/trade.ts";
import connect from "./db.ts";
import type { SwapData } from "commons/services/uniswapTypes.ts";

async function getOpenedTrade(userId: string, automationId: string): Promise<Trade | null> {
    const db = await connect();

    return db.trades.findFirst({
        where: { userId, automationId, pnl: 0 },
        orderBy: { id: "desc" }
    })
}

async function addTrade(trade: Trade): Promise<Trade> {
    if(!trade.userId || !trade.automationId) throw new Error(`Invalid trade.`);

    const db = await connect();

    return db.trades.create({
        data: new Trade(trade)
    })
}

async function closeTrade(userId: string, automationId: string, swap: SwapData): Promise<Trade | null> {
    if(!userId || !automationId) throw new Error(`Ivalid trade.`);

    const db = await connect();

    const trade = await getOpenedTrade(userId, automationId);
    if(!trade?.id) return null;

    const pnl = ((BigInt(swap.amountOut) * 100n) / BigInt(trade.openAmountIn)) - 100n;

    return db.trades.update({
        where: { id: trade.id },
        data: {
            closeAmountIn: swap.amountIn,
            closeAmountOut: swap.amountOut,
            closeDate: new Date(),
            closePrice: swap.price,
            pnl: Number(pnl)
        }
    })
}

export default {
    closeTrade,
    addTrade,
    getOpenedTrade
}