export interface IPortfolioWithDependentFlags {
    id: number;
    financialInstitution: string;
    name: string;
    holder: string;
    holderName: string;
    accountId: string;
    currency: string;
    logicallyDeleted: boolean;
    hasHoldings: boolean;
    hasPositions: boolean;

    version: number;
}