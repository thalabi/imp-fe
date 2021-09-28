export interface HoldingDetail {
    id: number;
    asOfDate: Date;
    instrumentId: number;
    ticker: string;
    exchange: string;
    currency: string;
    name: string;
    quantity: number;
    version: number;
}