export interface SaveHoldingRequest {
    id: number;
    instrumentId: number;
    instrumentType: string;
    portfolioId: number;
    instrument: URL;
    portfolio: URL;
    quantity: number;
    asOfDate: Date;
    version: number;
}