import { jest } from "@jest/globals"
import { Test, TestingModule } from "@nestjs/testing"
import { prismaMock } from "../bd.mock.js";
import { poolMock } from "./pool.service.mock.js";
import type { pools } from "commons/data/index.js";
import type { PoolService as PoolServiceType } from "../../src/pool/pool.service.js";
import { JsonObject } from "commons/data/runtime/library.js";

jest.unstable_mockModule("../../src/db.js", () => ({
    __esModule: true,
    default: prismaMock,
}));

const { PoolService } = await import("../../src/pool/pool.service.js");

describe("PoolService Tests", () => {

    let poolService: PoolServiceType;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            providers: [PoolService]
        }).compile();

        poolService = moduleFixture.get<PoolServiceType>(PoolService);

    })

    it("Should be defined", () => {
        expect(poolService).toBeDefined();
    })

    it("Should get a pool", async () => {
        prismaMock.pools.findUnique.mockResolvedValue(poolMock);

        const result = await poolService.getPool(poolMock.id);
        expect(result).toEqual(poolMock);
        expect(prismaMock.pools.findUnique).toHaveBeenCalledWith({
            where: { id: poolMock.id },
        });
    })

    it("Should get a pools (defaults)", async () => {
        prismaMock.pools.findMany.mockResolvedValue([{...poolMock}] as pools[]);

        const pageSize = 1;
        const result = await poolService.getPools();
        expect(result).toBeDefined();
        expect(result.length).toEqual(pageSize);
        expect(result[0].id).toEqual(poolMock.id);
    })

    it("Should NOT get a pool", async () => {
        prismaMock.pools.findUnique.mockResolvedValue(null);

        await expect(poolService.getPool(poolMock.id))
            .rejects
            .toEqual(new Error("Pool not found"));
    })

    it("Should search pool", async () => {
        prismaMock.pools.findMany.mockResolvedValue([poolMock]);

        const result = await poolService.searchPool(poolMock.symbol);
        expect(result).toBeDefined();
        expect(result.length).toBeTruthy();
    })

    it("Should NOT search a pool", async () => {
        prismaMock.pools.findMany.mockResolvedValue([]);

        await expect(poolService.searchPool(poolMock.symbol))
            .rejects
            .toEqual(new Error("Pool not found"));
    })

    it("Should get pools", async () => {
        prismaMock.pools.findMany.mockResolvedValue([{...poolMock}] as pools[]);

        const pageSize = 1;
        const result = await poolService.getPools(1, pageSize);
        expect(result).toBeDefined();
        expect(result.length).toEqual(pageSize);
        expect(result[0].id).toEqual(poolMock.id);
    })

    it("Should get symbols", async () => {
        prismaMock.pools.aggregateRaw.mockResolvedValue([{ _id: poolMock.symbol }] as unknown as JsonObject);

        const result = await poolService.getPoolSymbols();
        expect(result).toBeDefined();
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual(poolMock.symbol);
    })

    it("Should NOTget symbols", async () => {
        prismaMock.pools.aggregateRaw.mockResolvedValue(null!);

        const result = await poolService.getPoolSymbols();
        expect(result).toBeDefined();
        expect(result.length).toEqual(0);
    })

    it("Should get top pools", async () => {
        prismaMock.pools.findMany.mockResolvedValue([{...poolMock}] as pools[]);

        const result = await poolService.getTopPools();
        expect(result).toBeDefined();
        expect(result.length).toEqual(2);
        expect(result[0].id).toEqual(poolMock.id);
    })
})