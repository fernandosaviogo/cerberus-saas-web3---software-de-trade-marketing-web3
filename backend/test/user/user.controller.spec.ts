import { Test, TestingModule } from "@nestjs/testing"
import { activeUserMock, userServiceMock } from "./user.service.mock.js";
import { UserController } from "../../src/user/user.controller.js";
import { authServiceMock } from "../../test/auth/auth.service.mock.js";
import { UserDTO } from "src/user/user.dto.js";
import { Status } from "commons/models/status.js";
import { ForbiddenException } from "@nestjs/common";

describe("UserController Tests", () => {

    let userController: UserController;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [userServiceMock, authServiceMock]
        }).compile();

        userController = moduleFixture.get<UserController>(UserController);

    })

    it("Should be defined", () => {
        expect(userController).toBeDefined();
    })

    it("Should get user by walleet", async () => {
        const result = await userController.getUser("authorization", activeUserMock.address);
        expect(result).toBeDefined();
        expect(result.address).toEqual(activeUserMock.address);
    })

    it("Should NOT get user by walleet", async () => {
        await expect(userController.getUser("authorization", "0x456"))
            .rejects
            .toEqual(new ForbiddenException())
    })

    it("Should get user by id", async () => {
        const result = await userController.getUser("authorization", activeUserMock.id);
        expect(result).toBeDefined();
        expect(result.id).toEqual(activeUserMock.id);
    })

    it("Should NOT get user by id", async () => {
        await expect(userController.getUser("authorization", "abc456"))
            .rejects
            .toEqual(new ForbiddenException())
    })

    it("Should update user", async () => {
        const result = await userController.updateUser(activeUserMock.id, "authorization", {...activeUserMock} as UserDTO);
        expect(result).toBeDefined();
        expect(result.id).toEqual(activeUserMock.id);
    })

    it("Should NOT update user", async () => {
        await expect(userController.updateUser("abc456", "authorization", {...activeUserMock} as UserDTO))
            .rejects
            .toEqual(new ForbiddenException())
    })

    it("Should update user", async () => {
        const result = await userController.pay("authorization");
        expect(result).toBeDefined();
        expect(result.status).toEqual(Status.ACTIVE);
    })
})