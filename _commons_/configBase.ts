import * as dotenv from "dotenv";
dotenv.config();

export default class ConfigBase {
    //System
    static NODE_ENV: string = `${process.env.NODE_ENV || "developer"}`;
    static DEV_END: boolean = ConfigBase.NODE_ENV === "development";
    static SITE_URL: string = `${process.env.SITE_URL || "http://localhost:3000"}`;
    static MAILER_TRANSPORT: string = `${process.env.MAILER_TRANSPORT}`;

    static getDefaultFrom(transport: string) : string {
        if(!transport) return "";
        const spl = transport.split("//");
        return spl[spl.length -1]?.split(":")[0] ?? "";
    }

    static DEFAULT_FROM: string = ConfigBase.getDefaultFrom(ConfigBase.MAILER_TRANSPORT);

    //database
    static DATABASE_URL: string = `${process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/cerberus"}`;

    //blockchain
    static CEBERRUS_PAY_CONTRACT: string = `${process.env.CEBERRUS_PAY_CONTRACT}`;
    //static INFURA_NETWORK: string = `${process.env.INFURA_NETWORK}`;
    //static INFURA_API_KEY: string = `${process.env.INFURA_API_KEY}`;
    static RPC_NODE: string = `${process.env.RPC_NODE || "http://127.0.0.1:8545"}`;
    static ADMIN_PRIVATE_KEY: string = `${process.env.ADMIN_PRIVATE_KEY}`;

    //Security
    static CORS_ORIGIN: string = `${process.env.CORS_ORIGIN || "*"}`
    static JWT_SECRET: string = `${process.env.JWT_SECRET}`;
    static JWT_EXPIRES: number = parseInt(`${process.env.JWT_EXPIRES}`);
    static AES_KEY: string = `${process.env.AES_KEY}`;

    static UNISWAP_GRAPH_URL: string = process.env.UNISWAP_GRAPH_URL || "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
    static UNISWAP_ROUTER: string | undefined = process.env.UNISWAP_ROUTER;
}