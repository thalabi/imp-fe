import { Instrument } from "../../portfolio-holding-management/Instrument";

export interface InstrumentMutualFund {
    id: number;
    instrument: Instrument;

    company: string;

    rowVersion: number;
    _links: {
        self: {
            href: URL
        },
        instrumentMutualFund: {
            href: URL
            templated: boolean
        },
        instrument: {
            href: URL
        }
    }
}