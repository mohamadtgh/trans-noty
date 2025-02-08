export const TRONSCAN_API_TOKEN_KEY: string = "TRON-PRO-API-KEY";
export const DEFAULT_INTERVAL_CRONSYNTAX: string = "*/5 * * * * *";

export const tronScanApiEndpoint = (limit: number,address:string): string => {
    return `https://apilist.tronscanapi.com/api/trx/transfer?sort=-timestamp&count=true&limit=${limit}&start=0&address=${address}&filterTokenValue=0`;
};
