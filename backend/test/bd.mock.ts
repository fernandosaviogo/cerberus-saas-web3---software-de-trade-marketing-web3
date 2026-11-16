import { PrismaClient } from "commons/data/index.js";
import { jest } from "@jest/globals";
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended"

export const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

jest.unstable_mockModule("../src/db.js", () => ({
    __esModule: true,
    default: prismaMock
}))

beforeEach(() => {
    mockReset(prismaMock);
})
