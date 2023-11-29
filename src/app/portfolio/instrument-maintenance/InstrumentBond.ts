import { Instrument } from "../portfolio-holding-management/Instrument";

export interface InstrumentBond {
    id: number;
    instrument: Instrument;

    issuer: string;
    cusip: string;
    price: number | null;
    coupon: number | null;
    term: string;
    issueDate: Date | null;
    maturityDate: Date | null;
    paymentFrequency: string;
    nextPaymentDate: Date | null;
    emailNotification: boolean;

    rowVersion: number;
    _links: {
        self: {
            href: URL
        },
        instrumentBond: {
            href: URL
            templated: boolean
        },
        instrument: {
            href: URL
        }
    }
}