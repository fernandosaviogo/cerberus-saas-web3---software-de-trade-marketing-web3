/* istanbul ignore file */
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.Controller.js";
import { UserService } from "../user/user.service.js";
import { AuthService } from "./auth.service.js";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [JwtModule],
    controllers: [AuthController],
    providers: [UserService, AuthService]
})

export class AuthModule {}