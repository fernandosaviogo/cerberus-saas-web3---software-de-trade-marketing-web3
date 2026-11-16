import dotenv from "dotenv";
dotenv.config();

import { encrypt } from "commons/services/cryptoService.ts"

function start() {
    const lastIndex = process.argv[process.argv.length - 1];
    if (lastIndex === undefined) {
        throw new Error("Provide the text to encrypt as a command-line argument.");
    }

    console.log(`Encrypting ${lastIndex}`);
    console.log(encrypt(lastIndex));    
}

start();