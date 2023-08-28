export interface Portfolio {
    id: number;
    financialInstitution: string;
    accountNumber: number;
    name: string;
    currency: string;
    rowVersion: number;
    _links: {
        self: {
            href: URL
        },
        portfolio: {
            href: URL
        }
    };
}