export interface HoldingDetail {
    id: number;
    asOfDate: Date;
    instrumentId: number;
    ticker: string;
    //exchange: string;
    currency: string;
    name: string;
    quantity: number;
    latestPrice: number;
    latestPriceTimestamp: Date;

    instrumentType: string;
    // Interest bearing instrument details
    financialInstitution: string;
    type: string;
    term: string;
    interestRate: number;
    maturityDate: Date;
    promotionalInterestRate: number;
    promotionEndDate: Date;

    version: number;
}