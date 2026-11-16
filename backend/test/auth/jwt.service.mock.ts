import { jest } from "@jest/globals"
import { JwtService } from "@nestjs/jwt";
import { jwtMock } from "./auth.service.mock.js";

export const jwtServiceMock = {
    provide: JwtService,
    useValue: {
        sign: jest.fn<JwtService["sign"]>().mockReturnValue("abc123"),
        decode: jest.fn<JwtService["decode"]>().mockReturnValue(jwtMock),
        verify: jest.fn<JwtService["verify"]>().mockReturnValue(jwtMock)
    }
}