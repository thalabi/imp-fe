export interface Instrument {
    id: number;
    type: string;
    ticker: string;
    currency: string;
    name: string;
    notes: string | null;
    rowVersion: number | null;
    _links: {
        self: {
            href: URL
        },
        instrument: {
            href: URL
        }
    };
}