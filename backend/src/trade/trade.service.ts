import { Injectable } from "@nestjs/common";
import db from "../db.js";
import Trade from "commons/models/trade.js";

@Injectable()
export class TradeService {
    async getClosedTrades(userId: string, dateFrom: Date, dateTo: Date): Promise<Trade[]> {
        return db.trades.findMany({
            where: {
                userId,
                closeDate: {
                    gte: dateFrom,
                    lte: dateTo
                }
            }
        })
    }
}