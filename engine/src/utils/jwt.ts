import { sign, verify } from "commons/services/cryptoService.js";

const AUTH_MSG: string = "Autenticating to Cerberus. Timestamp: <timestamp>";

async function start() {
    const pk = process.argv[process.argv.length - 1];
    if (!pk) return console.error("This parameter is required: <privateKey>");

    const timestamp = Date.now();
    const message = AUTH_MSG.replace("<timestamp>", `${timestamp}`);
    const secret = await sign(pk, message);
    const wallet = verify(message, secret);

    console.log(`{
        "secret": "${secret}",
        "timestamp": "${timestamp}",
        "wallet": "${wallet}"
    }`);
}

start();