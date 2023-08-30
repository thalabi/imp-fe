export interface Portfolio {
    id: number;
    financialInstitution: string;
    accountNumber: string;
    name: string;
    currency: string;
    logicallyDeleted: boolean;
    version: number; // result returned by custom queries use this field
    rowVersion: number; // result returned by JPA Data Rest uses this field
    _links: {
        self: {
            href: URL
        },
        portfolio: {
            href: URL
        }
    };
}