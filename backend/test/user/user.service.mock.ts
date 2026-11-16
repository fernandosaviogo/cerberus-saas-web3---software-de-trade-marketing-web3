import { ChainId } from "commons/models/chainId.js";
import { Status } from "commons/models/status.js";
import type { User } from "commons/models/user.js";
import { UserService } from "../../src/user/user.service.js";
import { jest } from "@jest/globals";

export const newUserMock = {
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
} as User;

export const blockedUserMock = {
    ...newUserMock,
    status: Status.BLOCKED
}

export const activeUserMock = {
    ...newUserMock,
    status: Status.ACTIVE
}

export const bannedUserMock = {
    ...newUserMock,
    status: Status.BANNED
}

export const userServiceMock = {
    provide: UserService,
    useValue: {
        getUserByWallet: jest.fn<UserService["getUserByWallet"]>().mockResolvedValue(activeUserMock),
        getUser: jest.fn<UserService["getUser"]>().mockResolvedValue(activeUserMock),
        activateUser: jest.fn<UserService["activateUser"]>().mockResolvedValue(blockedUserMock),
        updateUser: jest.fn<UserService["updateUser"]>().mockResolvedValue(activeUserMock),
        addUser: jest.fn<UserService["addUser"]>().mockResolvedValue(newUserMock),
        payUser: jest.fn<UserService["payUser"]>().mockResolvedValue(activeUserMock),
    }
}