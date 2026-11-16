import type { ChainId } from 'commons/models/chainId.ts';
import connect from './db.ts';

import type { Token } from "commons/models/token.ts";

async function countTokens(network: ChainId) : Promise<number> {
    const db = await connect();

    const count = await db.tokens.count({
        where: { network }
    });

    return count;
}

async function getTokens(id: string) : Promise<Token | null> {
    const db = await connect();

    const token = await db.tokens.findUnique({
        where: { id }
    });

    return token;
}

async function addToken(token: Token) : Promise<Token> {
    if(!token.id) throw new Error("Token id is required");

    const db = await connect();

    const newToken = await db.tokens.create({
        data: token
    });

    return newToken;
}

export default {
    getTokens,
    addToken,
    countTokens
}
