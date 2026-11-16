import * as dotenv from "dotenv";
dotenv.config();
export default class ConfigBase {
    // system
    static NODE_ENV = `${process.env.NODE_ENV || "developer"}`;
    static DEV_END = ConfigBase.NODE_ENV === "development";
    static SITE_URL = `${process.env.SITE_URL || "http://localhost:3000"}`;
    static MAILER_TRANSPORT = `${process.env.MAILER_TRANSPORT}`;

    static getDefaultFrom(transport) {
        if (!transport)
            return "";
        const spl = transport.split("//");
        return spl[spl.length - 1]?.split(":")[0] ?? "";
    }
    
    static DEFAULT_FROM = ConfigBase.getDefaultFrom(ConfigBase.MAILER_TRANSPORT);

    // database
    static DATABASE_URL = `${process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/cerberus"}`;

    // blockchain
    static CEBERRUS_PAY_CONTRACT = `${process.env.CEBERRUS_PAY_CONTRACT}`;
    static INFURA_NETWORK = `${process.env.INFURA_NETWORK}`;
    static INFURA_API_KEY = `${process.env.INFURA_API_KEY}`;
    static ADMIN_PRIVATE_KEY = `${process.env.ADMIN_PRIVATE_KEY}`;

    // security
    static CORS_ORIGIN = `${process.env.CORS_ORIGIN || "*"}`;
    static JWT_SECRET = `${process.env.JWT_SECRET}`;
    static JWT_EXPIRES = parseInt(`${process.env.JWT_EXPIRES}`);
    static AES_KEY = `${process.env.AES_KEY}`;
}
//# sourceMappingURL=configBase.js.map