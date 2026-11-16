import config from '../config.ts';

import { PrismaClient } from "commons/data/index.js";

let singleton: PrismaClient | null = null;

// function to get the singleton instance of PrismaClient
export default async () : Promise<PrismaClient> => {
    if (!singleton) {
        singleton = new PrismaClient();
        await singleton.$connect();
    }

    return singleton;
} 