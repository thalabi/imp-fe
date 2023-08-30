export interface IPortfolioWithDependentFlags {
    id: number;
    financialInstitution: string;
    name: string;
    accountNumber: string;
    currency: string;
    logicallyDeleted: boolean;
    hasHoldings: boolean;
    hasPositions: boolean;

    version: number;
}