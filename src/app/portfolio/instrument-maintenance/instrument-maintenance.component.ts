import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { RestService } from '../../service/rest.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionService } from '../../service/session.service';
import { BaseComponent } from '../../base/base.component';
import { Table } from 'primeng/table';
import { HolderAndName } from '../portfolio-maintenance/HolderAndName';

@Component({
    selector: 'app-instrument-maintenance',
    templateUrl: './instrument-maintenance.component.html',
    styleUrls: ['./instrument-maintenance.component.css']
})
export class InstrumentMaintenanceComponent extends BaseComponent implements OnInit {
    selectedInstrumentType: string = ''

    currencies: Array<string> = []
    financialInstitutions: Array<string> = []
    holderOptions: Array<{ value: string, name: string }> = []
    instrumentTypes: Array<string> = []
    interestBearingTypes: Array<string> = []
    termOptions: Array<{ value: string, name: string }> = []
    registeredAccountOptions: Array<{ value: string | null, name: string }> = []
    paymentFrequencies: Array<string> = []
    exchanges: Array<string> = []

    constructor(
        public restService: RestService,
        public messageService: MessageService,
        //private sessionService: SessionService
    ) {
        super()
    }
    ngOnInit(): void {
        this.getInstrumentTypes()
    }

    onChangeInstrumentType(event: any) {
        console.log('this.selectedInstrumentType', this.selectedInstrumentType)
        if (! /* not */['INTEREST_BEARING', 'BOND', 'ETF', 'STOCK', 'MUTUAL_FUND'].includes(this.selectedInstrumentType)) {
            this.messageService.add({ severity: 'warn', summary: 'This instrument type is not supported at this time.' })
            return
        }
        this.messageService.clear()
    }

    getCurrencies() {
        this.restService.getCurrencies()
            .subscribe(
                {
                    next: (data: Array<string>) => {
                        console.log('data', data)
                        this.currencies = data
                    },
                    complete: () => {
                        console.log('http request completed')
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }
    getFinancialInstitutions() {
        this.restService.getFinancialInstitutions()
            .subscribe(
                {
                    next: (data: Array<string>) => {
                        console.log('data', data)
                        this.financialInstitutions = data
                    },
                    complete: () => {
                        console.log('http request completed')
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }
    getInstrumentTypes() {
        this.restService.getInstrumentTypes()
            .subscribe(
                {
                    next: (data: Array<string>) => {
                        console.log('data', data)
                        this.instrumentTypes = data
                    },
                    complete: () => {
                        console.log('http request completed')
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }
    getInterestBearingTypes() {
        this.restService.getInterestBearingTypes()
            .subscribe(
                {
                    next: (data: Array<string>) => {
                        console.log('data', data)
                        this.interestBearingTypes = data
                    },
                    complete: () => {
                        console.log('http request completed')
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }
    getTerms() {
        this.restService.getTerms()
            .subscribe(
                {
                    next: (data: Array<string>) => {
                        console.log('data', data)
                        data.forEach(term => this.termOptions.push({ value: term, name: term.substring(5) }))
                        console.log('this.termOptions', this.termOptions)
                    },
                    complete: () => {
                        console.log('http request completed')
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }

    getHolders() {
        this.restService.getHolders()
            .subscribe(
                {
                    next: (data: Array<HolderAndName>) => {
                        console.log('data', data)
                        data.forEach(holderAndName => this.holderOptions.push({ value: holderAndName.holder, name: holderAndName.name }))
                        //console.log('this.termOptions', this.termOptions)
                    },
                    complete: () => {
                        console.log('http request completed')
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }

    getRegisteredAccounts() {
        this.restService.getRegisteredAccounts()
            .subscribe(
                {
                    next: (data: Array<string>) => {
                        console.log('data', data)
                        this.registeredAccountOptions = [{ value: null, name: '<non registered>' }]
                        data.forEach(registeredAccount => this.registeredAccountOptions.push({ value: registeredAccount, name: registeredAccount }))
                    },
                    complete: () => {
                        console.log('http request completed')
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }
    getPaymentFrequencies() {
        this.restService.getPaymentFrequencies()
            .subscribe(
                {
                    next: (data: Array<string>) => {
                        console.log('data', data)
                        this.paymentFrequencies = data
                    },
                    complete: () => {
                        console.log('http request completed')
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }

    getExchanges() {
        this.restService.getExchanges()
            .subscribe(
                {
                    next: (data: Array<string>) => {
                        console.log('data', data)
                        this.exchanges = data
                    },
                    complete: () => {
                        console.log('http request completed')
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }

    @ViewChild('dt') dt: Table = {} as Table;
    // Hack to wrap filterGlobal and be able to specify type HTMLInputElement
    applyFilterGlobal($event: any, stringVal: any) {
        this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
    }


}
