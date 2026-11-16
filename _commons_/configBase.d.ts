export default class ConfigBase {
    static NODE_ENV: string;
    static DEV_END: boolean;
    static SITE_URL: string;
    static MAILER_TRANSPORT: string;
    static getDefaultFrom(transport: string): string;
    static DEFAULT_FROM: string;
    static DATABASE_URL: string;
    static CEBERRUS_PAY_CONTRACT: string;
    static INFURA_NETWORK: string;
    static INFURA_API_KEY: string;
    static ADMIN_PRIVATE_KEY: string;
    static CORS_ORIGIN: string;
    static JWT_SECRET: string;
    static JWT_EXPIRES: number;
    static AES_KEY: string;
}
