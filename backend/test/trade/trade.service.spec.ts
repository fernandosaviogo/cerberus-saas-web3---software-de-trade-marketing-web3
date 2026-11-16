import { jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { prismaMock } from "../bd.mock.js";
import { newTrade } from "./trade.service.mock.js";
import { trades } from "commons/data/index.js";
import type { TradeService as TradeServiceType } from "../../src/trade/trade.service.js";

jest.unstable_mockModule("../../src/db.js", () => ({
    __esModule: true,
    default: prismaMock,
}));

const { TradeService } = await import("../../src/trade/trade.service.js");

describe("tradeService Tests", () => {

    const userId = "user123";
    let tradeService: TradeServiceType;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            providers: [TradeService]
        }).compile();

        tradeService = moduleFixture.get<TradeServiceType>(TradeService);

    })

    it("Should be defined", () => {
        expect(tradeService).toBeDefined();
    })

    it("Should get closed trades", async () => {
        prismaMock.trades.findMany.mockResolvedValue([{ ...newTrade } as trades]);

        const automations = await tradeService.getClosedTrades(userId, new Date(), new Date());

        expect(automations.length).toEqual(1);
    })
})