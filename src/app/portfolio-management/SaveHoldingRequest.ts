export interface SaveHoldingRequest {
    id: number;
    instrumentId: number;
    portfolioId: number;
    instrument: URL;
    portfolio: URL;
    quantity: number;
    asOfDate: Date;
    version: number;
}