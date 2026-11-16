import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { User } from "../../../_commons_/models/user.js"
import db from "../db.js"
import { UserDTO } from "./user.dto.js";
import { Status } from "../../../_commons_/models/status.js";
import Config from "../config.js";
import { encrypt, decrypt } from "../../../_commons_/services/cryptoService.js"
import { pay } from "../../../_commons_/services/cerberusPayService.js"

@Injectable()
export class UserService {

    async getUserByWallet(address: string): Promise<User> {
        const user = await db.users.findFirst({
            where: {
                address: {
                    equals: address,
                    mode: "insensitive"
                }
            }
        })
        if (!user) {
            throw new NotFoundException("User not found");
        }

        user.privateKey = "";

        return user;

    }

    async getUser(id: string): Promise<User> {
        const user = await db.users.findUnique({
            where: {id}
        })
        if (!user) {
            throw new NotFoundException("User not found");
        }

        user.privateKey = decrypt(user.privateKey);

        return user;
    }

    static generateActivationCode(length: number): string {
        const validChairs = "0123456789";
        let token = "";

        for(let i=0; i < length; i++)
            token += validChairs[Math.floor(Math.random() * 10)];

        return token;
    }

    async addUser(user: UserDTO): Promise<User> {
        const oldUser = await db.users.findFirst({
            where: {
                OR: [{
                    address: user.address
                }, {
                    email: user.email
                }]
            }
        });

        if(oldUser) {
            if(oldUser.status !== Status.NEW)
                throw new ConflictException(`User already exists with the same wallet or email.`);
            else {
                return db.users.update({
                    where: { id: oldUser.id},
                    data: {
                        activationCode: UserService.generateActivationCode(6),
                        activationDate: new Date()
                    }
                })
            }
        }

        return db.users.create({
            data: {
                address: user.address,
                email: user.email,
                name: user.name,
                planId: user.planId,
                activationCode: UserService.generateActivationCode(6),
                activationDate: new Date(),
                privateKey: "",
                status: Status.NEW,
                network: Config.CHAIN_ID
            }
        })
    }

    async payUser(address: string): Promise<User> {
        const user = await this.getUserByWallet(address);
        if(user.status !== Status.BLOCKED) throw new ForbiddenException()

        await pay(user.address);

        const updatedUser = await db.users.update({
            where: {id: user.id},
            data: {status: Status.ACTIVE}
        })

        updatedUser.privateKey = "";
        return updatedUser;
    }

    async updateUser(id: string, user: UserDTO): Promise<User> {
        
        const data: any = {
            address: user.address,
            email: user.email,
            name: user.name
        }

        if(user.privateKey) {
            data.privateKey = encrypt(user.privateKey);
        }

        const updatedUser = await db.users.update({
            where: {id},
            data
        })

        if (updatedUser) 
            updatedUser.privateKey = "";

        return updatedUser;
    }

    async activateUser(wallet: string, code: string): Promise<User> {
        const user = await this.getUserByWallet(wallet);

        if(user.status !== Status.NEW) return user;

        if(user.activationCode !== code)
            throw new UnauthorizedException(`Wrong activation code.`);

        const tenMinutesAgo = new Date(Date.now() - (10 * 60 * 1000));
        if(user.activationDate < tenMinutesAgo)
            throw new UnauthorizedException(`Activation code expired.`)

        const updatedUSer = await db.users.update({
            where: { id: user.id},
            data: {
                status: Status.BLOCKED
            }
        })

        updatedUSer.privateKey = "";
        return updatedUSer;
    }
}