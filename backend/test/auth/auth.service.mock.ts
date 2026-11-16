import { Status } from "commons/models/status.js";
import { AuthService } from "../../src/auth/auth.service.js";
import { JWT } from "commons/models/jwt.js";
import { jest } from "@jest/globals"

export const jwtMock = {
    address: "0x123",
    name: "FernandoSG",
    planId: "Gold",
    status: Status.ACTIVE,
    userId: "abc123"
} as JWT

export const authServiceMock = {
    provide: AuthService,
    useValue: {
        createToken: jest.fn<AuthService["createToken"]>().mockResolvedValue("abc123"),
        decodeToken: jest.fn<AuthService["decodeToken"]>().mockReturnValue(jwtMock),
        checkToken: jest.fn<AuthService["checkToken"]>().mockResolvedValue(jwtMock)
    }
}