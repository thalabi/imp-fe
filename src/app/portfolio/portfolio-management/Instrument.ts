export interface Instrument {
    ticker: string;
    //exchange: string;
    currency: string;
    name: string;
    _links: {
        self: {
            href: URL
        },
        instrument: {
            href: URL
        }
    };
}