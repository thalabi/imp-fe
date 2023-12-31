import { Instrument } from "../../portfolio-holding-management/Instrument";

export interface InstrumentEtfStock {
    id: number;
    instrument: Instrument;

    exchange: string;

    rowVersion: number;
    _links: {
        self: {
            href: URL
        },
        instrumentEtf: {
            href: URL
            templated: boolean
        },
        instrument: {
            href: URL
        }
    }
}