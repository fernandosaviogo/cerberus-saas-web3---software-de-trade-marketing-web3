import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JWT } from "../../../_commons_/models/jwt.js"
import Config from "../config.js";

@Injectable()
export class AuthService {

    constructor(private readonly jwtService: JwtService) {

    }

    async createToken(payload: JWT): Promise<string> {
        return this.jwtService.sign(payload, {
            secret: Config.JWT_SECRET,
            expiresIn: Config.JWT_EXPIRES
        })
    }

    decodeToken(authorization: string): JWT {
        return this.jwtService.decode(authorization.replace("Bearer", "")) as JWT;
    }

    async checkToken(token: string): Promise<JWT> {
        try {
            return this.jwtService.verify(token.replace("Bearer", ""), {
                secret: Config.JWT_SECRET
            }) as JWT;
        } catch(err) {
            //console.log(err);
            throw new UnauthorizedException("Invalid JWT.");
        }
    }

}