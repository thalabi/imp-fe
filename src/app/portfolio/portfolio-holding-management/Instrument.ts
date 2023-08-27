export interface Instrument {
    id: number | null;
    type: string | null;
    ticker: string | null;
    currency: string | null;
    name: string | null;
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