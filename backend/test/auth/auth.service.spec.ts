import { jest } from "@jest/globals"
import { Test, TestingModule } from "@nestjs/testing"
import { prismaMock } from "../bd.mock.js";
import { AuthService } from "../../src/auth/auth.service.js";
import { jwtServiceMock } from "./jwt.service.mock.js";
import { jwtMock } from "./auth.service.mock.js";
import { UnauthorizedException } from "@nestjs/common";

jest.unstable_mockModule("../../src/db.js", () => ({
    default: prismaMock,
}));

describe("AuthService Tests", () => {

    let authService: AuthService;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            providers: [AuthService, jwtServiceMock]
        }).compile();

        authService = moduleFixture.get<AuthService>(AuthService);

    })

    it("Should be defined", () => {
        expect(authService).toBeDefined();
    })

    it("Should create token", async () => {
        const result = await authService.createToken(jwtMock);
        expect(result).toBeTruthy();
    })

    it("Should decode token", () => {
        const result = authService.decodeToken("abc123");
        expect(result).toBeDefined();
        expect(result.userId).toEqual(jwtMock.userId);
    })

    it("Should check token", async () => {
        const result = await authService.checkToken("abc123");
        expect(result).toBeTruthy();
    })

    it("Should NOT check token", async () => {
        await expect(authService.checkToken(null!))
            .rejects
            .toEqual(new UnauthorizedException("Invalid JWT."))
    })
})

