import connect from "./db.ts"
import type { Status } from "commons/models/status.ts"
import type { User } from "commons/models/user.ts"
import { decrypt } from "commons/services/cryptoService.ts";

async function updateUserStatus(address: string, status: Status): Promise<User> {
    const db = await connect();

    const user = await db.users.update({
        where: { address },
        data: { status }
    })

    return user;
}

async function getUserById(userId: string): Promise<User | null> {
    const db = await connect();

    const user = await db.users.findUnique({
        where: {id: userId}
    })

    if(!user) return null;

    if(user.privateKey)
        user.privateKey = decrypt(user.privateKey);

    return user;
}

export default {
    updateUserStatus,
    getUserById
}