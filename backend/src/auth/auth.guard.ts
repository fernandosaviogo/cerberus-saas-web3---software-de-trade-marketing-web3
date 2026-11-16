/* istanbul ignore file */
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service.js";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private readonly authService: AuthService) {

    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const {authorization} = context.switchToHttp().getRequest().headers;
        await this.authService.checkToken(authorization || "");
        return true;
    }
}