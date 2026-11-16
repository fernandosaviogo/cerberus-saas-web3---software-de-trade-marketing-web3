import { jest } from "@jest/globals";
import type { pools } from "commons/data/index.js";
import { PoolService } from '../../src/pool/pool.service.js';

export const poolMock: pools = {
    id: "pool-1",
    token0: "token-0",
    token1: "token-1",
    symbol: "TOKEN0/TOKEN1",
    symbol0: "TOKEN0",
    symbol1: "TOKEN1",
    fee: 3000,
    exchange: 1,
    network: 1,
    price0: 1,
    price0_15: null,
    price0_60: null,
    price0Change: 0,
    price0Change_15: null,
    price0Change_60: null,
    price1: 1,
    price1_15: null,
    price1_60: null,
    price1Change: 0,
    price1Change_15: null,
    price1Change_60: null,
    lastUpdate: new Date(),
    lastUpdate_15: null,
    lastUpdate_60: null,
}

export const poolServiceMock = {
    provide: PoolService,
    useValue: { 
        getPool: jest.fn<() => Promise<pools>>().mockResolvedValue(poolMock),
        getPools: jest.fn<() => Promise<pools[]>>().mockResolvedValue([poolMock]),
        searchPool: jest.fn<() => Promise<pools[]>>().mockResolvedValue([poolMock]),
        getPoolSymbols: jest.fn<() => Promise<string[]>>().mockResolvedValue([poolMock.symbol]),
        getTopPools: jest.fn<() => Promise<pools[]>>().mockResolvedValue([poolMock]),
    }
};
