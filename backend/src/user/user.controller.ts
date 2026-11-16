import { Controller, Post, Headers, Get, Param, Patch, Body, UseGuards, ForbiddenException } from "@nestjs/common";
import { UserService } from "./user.service.js";
import { UserDTO } from "./user.dto.js";
import { AuthGuard } from "../auth/auth.guard.js";
import { AuthService } from "../auth/auth.service.js";

@Controller("users")
export class UserController {
    
    constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

    @UseGuards(AuthGuard)
    @Post("pay")
    async pay(@Headers("Authorization") authorization: string) {

        const jwt = this.authService.decodeToken(authorization);
        
        return this.userService.payUser(jwt.address);
    }

    @UseGuards(AuthGuard)
    @Get(":identifier")
    async getUser(@Headers("Authorization") authorization: string, @Param("identifier") identifier: string) {
        const jwt = this.authService.decodeToken(authorization);
        
        if(identifier.startsWith("0x")) {
            if(jwt.address.toUpperCase() !== identifier.toUpperCase()) throw new ForbiddenException()
            return this.userService.getUserByWallet(identifier);
        } else {
            if(jwt.userId !== identifier) throw new ForbiddenException()
            const user = await this.userService.getUser(identifier);
            user.privateKey = "";
            return user;
        }
    }

    @UseGuards(AuthGuard)
    @Patch(":id")
    async updateUser(@Param("id") id: string, @Headers("Authorization") authorization: string, @Body() user: UserDTO) {
        const jwt = this.authService.decodeToken(authorization);
        
        if(jwt.userId !== id) throw new ForbiddenException()

        return this.userService.updateUser(id, user);
    }
}