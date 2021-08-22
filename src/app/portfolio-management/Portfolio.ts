export interface Portfolio {
    institution: string;
    accountNumber: number;
    name: string;
    currency: string;
    _links: {
        self: {
            href: URL
        },
        portfolio: {
            href: URL
        }
    };
}