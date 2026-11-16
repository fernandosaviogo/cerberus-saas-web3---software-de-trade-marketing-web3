import { jest } from "@jest/globals"
import { Test, TestingModule } from "@nestjs/testing"
import { prismaMock } from "../bd.mock.js";
import { users } from "commons/data/index.js";
import type { UserService as UserServiceType } from "../../src/user/user.service.js";
import { UserDTO } from "src/user/user.dto.js";
import { Status } from "commons/models/status.js";
import { ConflictException, UnauthorizedException, NotFoundException, ForbiddenException } from "@nestjs/common";

jest.unstable_mockModule("../../src/db.js", () => ({
    __esModule: true,
    default: prismaMock,
}));

jest.unstable_mockModule("commons/services/cerberusPayService.js", () => ({
    pay: jest.fn(),
}));

const { activeUserMock, blockedUserMock, newUserMock } = await import("./user.service.mock.js");
const { UserService } = await import("../../src/user/user.service.js");

describe("PoolService Tests", () => {

    let userService: UserServiceType;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            providers: [UserService]
        }).compile();

        userService = moduleFixture.get<UserServiceType>(UserService);

    })

    it("Should be defined", () => {
        expect(userService).toBeDefined();
    })

    it("Should get user by wallet", async () => {
        prismaMock.users.findFirst.mockResolvedValue({ ...newUserMock } as users);

        const result = await userService.getUserByWallet(newUserMock.address);
        expect(result).toBeDefined();
        expect(result.address).toEqual(newUserMock.address);
    })

    it("Should not get user by wallet", async () => {
        prismaMock.users.findFirst.mockResolvedValue(null);

        await expect(userService.getUserByWallet(newUserMock.address))
            .rejects
            .toEqual(new NotFoundException("User not found"))
    })

    it("Should get user by id", async () => {
        prismaMock.users.findUnique.mockResolvedValue({ ...newUserMock } as users);

        const result = await userService.getUser(newUserMock.id);
        expect(result).toBeDefined();
        expect(result.id).toEqual(newUserMock.id);
    })

    it("Should not get user by id", async () => {
        prismaMock.users.findUnique.mockResolvedValue(null);

        await expect(userService.getUser(newUserMock.id))
            .rejects
            .toEqual(new NotFoundException("User not found"))
    })

    it("Should add user", async () => {
        prismaMock.users.create.mockResolvedValue({ ...newUserMock } as users);

        const result = await userService.addUser({...newUserMock} as UserDTO);
        expect(result).toBeDefined();
        expect(result.id).toBeTruthy();
    })

    it("Should not add user (update instead)", async () => {
        prismaMock.users.update.mockResolvedValue({ ...newUserMock, activationCode: "654321", activationDate: new Date() } as users);
        prismaMock.users.findFirst.mockResolvedValue({ ...newUserMock } as users);

        const result = await userService.addUser({...newUserMock} as UserDTO);
        expect(result).toBeDefined();
        expect(result.activationCode).not.toEqual(newUserMock.activationCode);
        expect(result.activationDate.getTime()).toBeGreaterThan(newUserMock.activationDate.getTime())
    })

    it("Should not add user (conflict)", async () => {
        prismaMock.users.findFirst.mockResolvedValue({ ...activeUserMock } as users);

        await expect(userService.addUser({...newUserMock} as UserDTO))
            .rejects
            .toEqual(new ConflictException(`User already exists with the same wallet or email.`))
    })

    it("Should pay user", async () => {
        prismaMock.users.update.mockResolvedValue({ ...activeUserMock } as users);
        prismaMock.users.findFirst.mockResolvedValue({ ...blockedUserMock } as users);        

        const result = await userService.payUser(blockedUserMock.address);
        expect(result).toBeDefined();
        expect(result.status).toEqual(Status.ACTIVE);
    })

    it("Should not pay user", async () => {
        prismaMock.users.findFirst.mockResolvedValue({ ...activeUserMock } as users);        

        await expect(userService.payUser(blockedUserMock.address))
            .rejects
            .toEqual(new ForbiddenException())
    })

    it("Should update user", async () => {
        prismaMock.users.update.mockResolvedValue({ ...newUserMock } as users); 

        const result = await userService.updateUser(newUserMock.id, {...newUserMock} as UserDTO);
        expect(result).toBeDefined();
        expect(result.status).toEqual(Status.NEW);
    })

    it("Should activate user", async () => {
        prismaMock.users.update.mockResolvedValue({ ...blockedUserMock } as users);
        prismaMock.users.findFirst.mockResolvedValue({ ...newUserMock } as users);

        const result = await userService.activateUser(newUserMock.address, newUserMock.activationCode);
        expect(result).toBeDefined();
        expect(result.status).toEqual(Status.BLOCKED);
    })

    it("Should not activate user (activated)", async () => {
        prismaMock.users.findFirst.mockResolvedValue({ ...activeUserMock } as users);

        const result = await userService.activateUser(activeUserMock.address, activeUserMock.activationCode);
        expect(result).toBeDefined();
        expect(result.status).toEqual(Status.ACTIVE);
    })

    it("Should not activate user(wrong vode)", async () => {
        prismaMock.users.findFirst.mockResolvedValue({ ...newUserMock, activationCode: "654321" } as users);

        await expect(userService.activateUser(newUserMock.address, newUserMock.activationCode))
            .rejects
            .toEqual(new UnauthorizedException(`Wrong activation code.`))
    })

    it("Should not activate user(outdated vode)", async () => {
        const oneHourAgo = new Date(Date.now() - (1 * 60 * 60 * 1000));
        prismaMock.users.findFirst.mockResolvedValue({ ...newUserMock, activationDate: oneHourAgo } as users);

        await expect(userService.activateUser(newUserMock.address, newUserMock.activationCode))
            .rejects
            .toEqual(new UnauthorizedException(`Activation code expired.`))
    })
})