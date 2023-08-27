export interface IPortfolioWithDependentFlags {
    id: number;
    lk: String;
    financialInstitution: number;
    financialInstitutionName: string;
    name: string;
    accountNumber: string;
    currency: string;
    logicallyDeleted: boolean;
    hasHoldings: boolean;
    hasPositions: boolean;

    version: number;
}