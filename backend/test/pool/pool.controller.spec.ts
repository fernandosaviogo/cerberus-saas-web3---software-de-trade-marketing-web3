import { jest } from "@jest/globals"
import { Test, TestingModule } from "@nestjs/testing"
import { prismaMock } from "../bd.mock.js";
import { poolServiceMock, poolMock } from "./pool.service.mock.js";
import type { PoolController as PoolControllerType } from "../../src/pool/pool.controller.js";

jest.unstable_mockModule("../../src/db.js", () => ({
    __esModule: true,
    default: prismaMock,
}));

const { PoolController } = await import("../../src/pool/pool.controller.js");
const { AuthGuard } = await import("../../src/auth/auth.guard.js");

describe("PoolController Tests", () => {

    let poolController: PoolControllerType;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [PoolController],
            providers: [poolServiceMock],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        poolController = moduleFixture.get<PoolControllerType>(PoolController);

    })

    it("Should be defined", () => {
        expect(poolController).toBeDefined();
    })

    it("Should get pool", async () => {
        const pool = await poolController.getPool(poolMock.id);
        expect(pool).toBeDefined();
        expect(pool.id).toEqual(poolMock.id);
    })

    it("Should search pool", async () => {
        const pools = await poolController.searchPool(poolMock.symbol);
        expect(pools).toBeDefined();
        expect(pools.length).toBeTruthy();
    })

    it("Should NOT search pool", async () => {
        poolServiceMock.useValue.searchPool.mockResolvedValue([]);
        
        await expect(poolController.searchPool(poolMock.symbol))
            .rejects
            .toEqual(new Error("Pool not found"));
    })

    it("Should get pools", async () => {
        const pools = await poolController.getPools(1, 1);
        expect(pools).toBeDefined();
        expect(pools.length).toEqual(1);
        expect(pools[0].id).toEqual(poolMock.id);
    })

    it("Should NOT get pool", async () => {
        poolServiceMock.useValue.getPool.mockResolvedValue(null!);
        
        await expect(poolController.getPool(poolMock.id))
            .rejects
            .toEqual(new Error("Pool not found"));
    })

    it("Should get top pools", async () => {
        const pools = await poolController.topPools();
        expect(pools).toBeDefined();
        expect(pools.length).toEqual(1);
        expect(pools[0].id).toEqual(poolMock.id);
    })

    it("Should get symbols", async () => {
        const pools = await poolController.getPoolSymbols();
        expect(pools).toBeDefined();
        expect(pools.length).toEqual(1);
        expect(pools[0]).toEqual(poolMock.symbol);
    })
})