import { jest } from "@jest/globals"
import { Test, TestingModule } from "@nestjs/testing"
import { prismaMock } from "../bd.mock.js";
import type { AuthController } from "../../src/auth/auth.Controller.js";
import { AuthDTO } from "src/auth/auth.dto.js";
import { UserDTO } from "src/user/user.dto.js";
import { Status } from "commons/models/status.js";
import { ChainId } from "commons/models/chainId.js";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";

jest.unstable_mockModule("../../src/db.js", () => ({
    default: prismaMock,
}));

jest.unstable_mockModule("@nestjs-modules/mailer", () => ({
    MailerService: jest.fn(),
}));

jest.unstable_mockModule("ethers", () => ({
    ethers: {
        verifyMessage: (message: string, secret: string) => {
            if (!message || !secret) throw new Error();
            return "0x123"
        }
    }
}));

const { AuthController: AuthControllerClass } = await import("../../src/auth/auth.Controller.js");
const { bannedUserMock, userServiceMock } = await import("../../test/user/user.service.mock.js");
const { authServiceMock } = await import("./auth.service.mock.js");
const { mailerServiceMock } = await import("./mailer.service.mock.js");

describe("AuthController Tests", () => {

    const authDTO = {
        secret: "abc123",
        timestamp: Date.now(),
        wallet: "0x123"
    } as AuthDTO;

    const userDTO = {
        address: "0x123",
        name: "Test Mock",
        email: "test@mock.com.br",
        id: "abc123",
        activationCode: "123456",
        activationDate: new Date(),
        network: ChainId.MAINNET,
        planId: "Gold",
        privateKey: "abc123",
        status: Status.NEW
    } as UserDTO;

    let authController: AuthController;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [AuthControllerClass],
            providers: [userServiceMock, mailerServiceMock, authServiceMock]
        }).compile();

        authController = moduleFixture.get<AuthController>(AuthControllerClass);

    })

    it("Should be defined", () => {
        expect(authController).toBeDefined();
    })

    it("Should sign in", async () => {
        const result = await authController.signin(authDTO);
        expect(result).toEqual("abc123");
    })

    it("Should NOT sign in (oudated)", async () => {
        const oneHourAgo = Date.now() - (1 * 60 * 60 * 1000);
        await expect(authController.signin({ ...authDTO, timestamp: oneHourAgo }))
            .rejects
            .toEqual(new BadRequestException("timestamp too old."))
    })

    it("Should NOT sign in (invalid secret)", async () => {
        await expect(authController.signin({ ...authDTO, secret: null! }))
            .rejects
            .toEqual(new BadRequestException("Invalid secret."))
    })

    it("Should NOT sign in (wrong wallet)", async () => {
        await expect(authController.signin({ ...authDTO, wallet: "0x456" }))
            .rejects
            .toEqual(new UnauthorizedException("Wallet and secret doenst match."))
    })

    it("Should NOT sign in (status banned)", async () => {
        userServiceMock.useValue.getUserByWallet.mockResolvedValue(bannedUserMock);
        await expect(authController.signin({ ...authDTO }))
            .rejects
            .toEqual(new UnauthorizedException("Banned user."))
    })

    it("Should sign up", async () => {
        const result = await authController.signup(userDTO);
        expect(result).toBeDefined();
        expect(result.status).toEqual(Status.NEW);
    })

    it("Should activade", async () => {
        const result = await authController.activate(userDTO.address, "123456");
        expect(result).toEqual("abc123");
    })
})

