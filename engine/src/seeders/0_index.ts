import type ISeeder from "./ISeeder.ts";
import tokensSeeder from "./1_tokens.ts";
import poolSeeder from "./2_pools.ts";

const seeders : ISeeder[] = [
    tokensSeeder,
    poolSeeder
]

async function start() {
    console.log(`Initializing Seeders Index...`);
    for(let i=0; i < seeders.length; i++) {
        await seeders[i]?.execute();
    }
    console.log(`Finalized Seeders Index...`)
}

start();