import { Instrument } from "../portfolio-management/Instrument";

export interface InstrumentInterestBearing {
    // id: number;
    // version: number;
    instrument: Instrument;
    type: string | null;
    financialInstitution: string | null;
    price: number | null;
    interestRate: number | null;
    term: string | null;
    maturityDate: Date | null;
    nextPaymentDate: Date | null;
    promotionalInterestRate: number | null;
    promotionEndDate: Date | null;
    emailNotification: boolean | null;
    _links: {
        self: {
            href: URL
        },
        instrumentInterestBearing: {
            href: URL
            templated: boolean
        },
        instrument: {
            href: URL
        }
    }
}