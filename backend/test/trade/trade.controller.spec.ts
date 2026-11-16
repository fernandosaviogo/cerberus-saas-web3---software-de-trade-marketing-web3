import { jest } from "@jest/globals"
import { Test, TestingModule } from "@nestjs/testing"
import { prismaMock } from "../bd.mock.js";
import type { TradeController as TradeControllerType } from "../../src/trade/trade.controller.js";
import { tradeServiceMock } from "./trade.service.mock.js";
import { authServiceMock } from "../auth/auth.service.mock.js";

jest.unstable_mockModule("../../src/db.js", () => ({
    __esModule: true,
    default: prismaMock,
}));

const { TradeController } = await import("../../src/trade/trade.controller.js");
const { AuthGuard } = await import("../../src/auth/auth.guard.js");

describe("TradeController Tests", () => {

    let tradeController: TradeControllerType;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [TradeController],
            providers: [tradeServiceMock, authServiceMock],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        tradeController = moduleFixture.get<TradeControllerType>(TradeController);

    })

    it("Should be defined", () => {
        expect(tradeController).toBeDefined();
    });

    it("Should get close trades", async () => {
        const result = await tradeController.getClosedtrades("authorization", Date.now() - 1, Date.now());
        
        expect(result.length).toEqual(1);
    });
});