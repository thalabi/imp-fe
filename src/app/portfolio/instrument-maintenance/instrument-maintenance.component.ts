import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CrudEnum } from '../../crud-enum';
import { RestService } from '../../service/rest.service';
import { InstrumentInterestBearing } from './InstrumentInterestBearing';
import { HttpErrorResponse } from '@angular/common/http';
import { Instrument } from '../portfolio-holding-management/Instrument';
import { SessionService } from '../../service/session.service';

@Component({
    selector: 'app-instrument-maintenance',
    templateUrl: './instrument-maintenance.component.html',
    styleUrls: ['./instrument-maintenance.component.css']
})
export class InstrumentMaintenanceComponent implements OnInit {

    currencies: Array<string> = []
    financialInstitutions: Array<string> = []
    instrumentTypes: Array<string> = []
    interestBearingTypes: Array<string> = []
    termOptions: Array<{ value: string, name: string }> = []

    selectedInstrumentType: string = ''
    instrumentInterestBearings: InstrumentInterestBearing[] | null = null;
    loadingStatus: boolean = false;
    instrumentInterestBearingCount: number = 0;
    instrumentInterestBearingSelectedRow: InstrumentInterestBearing = {} as InstrumentInterestBearing;
    crudRow: InstrumentInterestBearing = {} as InstrumentInterestBearing
    modifyAndDeleteButtonsDisable: boolean = true;
    crudMode: CrudEnum = {} as CrudEnum
    crudEnum = CrudEnum; // Used in html to refer to enum
    displayDialog: boolean = false

    instrumentInterestBearingForm = this.formBuilder.group({
        name: ['', Validators.required],
        currency: ['', Validators.required],
        ticker: [''],
        type: ['', Validators.required],
        financialInstitution: [''],
        price: this.formBuilder.control<number | null>(null),
        interestRate: this.formBuilder.control<number | null>(null, Validators.required),
        term: this.formBuilder.control<string | null>(null),
        maturityDate: this.formBuilder.control<Date | null>(null),
        nextPaymentDate: this.formBuilder.control<Date | null>(null),
        promotionalInterestRate: this.formBuilder.control<number | null>(null),
        promotionEndDate: this.formBuilder.control<Date | null>(null),
        emailNotification: this.formBuilder.control<boolean | null>(true, Validators.required)
    })

    constructor(
        private restService: RestService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private sessionService: SessionService
    ) { }


    ngOnInit(): void {
        this.getCurrencies()
        this.getFinancialInstitutions()
        this.getInstrumentTypes()
        this.getInterestBearingTypes()
        this.getTerms()
    }

    onChangeInstrumentType(event: any) {
        console.log('this.selectedInstrumentType', this.selectedInstrumentType)
        if (this.selectedInstrumentType !== 'INTEREST_BEARING') {
            this.messageService.add({ severity: 'warn', summary: 'Only Interest Bearing instruments are supported at this time.' })
            this.instrumentInterestBearings = null
            return
        }
        this.messageService.clear()
        console.log('before getInstrumentInterestBearings()')
        this.getInstrumentInterestBearings()
        console.log('after getInstrumentInterestBearings()')
    }

    private getInstrumentInterestBearings() {
        const tableName: string = 'instrument_interest_bearing'
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        this.restService.getTableData(tableName, 0, 999, [], 'instrumentInterestBearingInlineInstrument')
            .subscribe(
                {
                    next: (data: any) => {
                        this.instrumentInterestBearings = data._embedded[entityNameResource]
                        this.transformInstrumentInterestBearingsDateFields()
                        console.log('this.instrumentInterestBearings', this.instrumentInterestBearings)
                        this.instrumentInterestBearingCount = data.page.totalElements
                        this.loadingStatus = false

                        //this.portfolioList = this.buildPortfolioList(this.portfolioRows)
                    },
                    complete: () => {
                        console.log('http request completed')
                        // sort by instrument name
                        // this cannot be done by jpa data rest becuase does not support sort by assosiation columns
                        this.instrumentInterestBearings!.sort((a, b) => (a.instrument.name! < b.instrument.name!) ? -1 : (a.instrument.name! > b.instrument.name!) ? 1 : 0)
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }

    private transformInstrumentInterestBearingsDateFields() {
        this.instrumentInterestBearings!.forEach(instrumentInterestBearing => {
            // convert ISO8601 date to Date object
            instrumentInterestBearing.maturityDate = instrumentInterestBearing.maturityDate ? new Date(instrumentInterestBearing.maturityDate) : null
            instrumentInterestBearing.nextPaymentDate = instrumentInterestBearing.nextPaymentDate ? new Date(instrumentInterestBearing.nextPaymentDate) : null
            instrumentInterestBearing.promotionEndDate = instrumentInterestBearing.promotionEndDate ? new Date(instrumentInterestBearing.promotionEndDate) : null
        })

    }
    onRowSelect(event: any) {
        console.log(event);
        console.log('onRowSelect()')
        this.crudRow = Object.assign({}, this.instrumentInterestBearingSelectedRow);
        this.modifyAndDeleteButtonsDisable = false;
        // this.formAttributes.associations.forEach(associationAttributes => {
        //     this.fetchAssosciatedRows(this.crudRow, associationAttributes);
        // });
    }
    onRowUnselect(event: any) {
        console.log(event);
        this.modifyAndDeleteButtonsDisable = true;
        //this.selectedRow = new FlightLog(); // This a hack. If don't init selectedFlightLog, dialog will produce exception
    }

    showDialog(crudMode: CrudEnum) {
        this.displayDialog = true;
        this.sessionService.setDisableParentMessages(true)
        this.crudMode = crudMode;
        console.log('this.crudMode', this.crudMode);
        switch (this.crudMode) {
            case CrudEnum.ADD:
                this.instrumentInterestBearingForm.controls.emailNotification.patchValue(true);
                this.instrumentInterestBearingForm.enable();
                break;
            case CrudEnum.UPDATE:
                this.fillInFormWithValues();
                this.instrumentInterestBearingForm.enable();
                break;
            case CrudEnum.DELETE:
                this.fillInFormWithValues();
                this.instrumentInterestBearingForm.disable();
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
    }

    private fillInFormWithValues(): void {
        console.log('this.instrumentInterestBearingSelectedRow', this.instrumentInterestBearingSelectedRow)
        this.instrumentInterestBearingForm.controls.name.patchValue(this.instrumentInterestBearingSelectedRow.instrument.name);
        // lookup instrument object from instrumentRows (table)
        this.instrumentInterestBearingForm.controls.currency.patchValue(this.instrumentInterestBearingSelectedRow.instrument.currency);
        this.instrumentInterestBearingForm.controls.ticker.patchValue(this.instrumentInterestBearingSelectedRow.instrument.ticker);

        this.instrumentInterestBearingForm.controls.type.patchValue(this.instrumentInterestBearingSelectedRow.type);
        this.instrumentInterestBearingForm.controls.financialInstitution.patchValue(this.instrumentInterestBearingSelectedRow.financialInstitution);
        this.instrumentInterestBearingForm.controls.price.patchValue(this.instrumentInterestBearingSelectedRow.price);
        this.instrumentInterestBearingForm.controls.interestRate.patchValue(this.instrumentInterestBearingSelectedRow.interestRate);
        this.instrumentInterestBearingForm.controls.term.patchValue(this.instrumentInterestBearingSelectedRow.term);
        this.instrumentInterestBearingForm.controls.maturityDate.patchValue(this.instrumentInterestBearingSelectedRow.maturityDate);
        this.instrumentInterestBearingForm.controls.nextPaymentDate.patchValue(this.instrumentInterestBearingSelectedRow.nextPaymentDate);
        this.instrumentInterestBearingForm.controls.promotionalInterestRate.patchValue(this.instrumentInterestBearingSelectedRow.promotionalInterestRate);
        this.instrumentInterestBearingForm.controls.promotionEndDate.patchValue(this.instrumentInterestBearingSelectedRow.promotionEndDate);
        this.instrumentInterestBearingForm.controls.emailNotification.patchValue(this.instrumentInterestBearingSelectedRow.emailNotification);
        console.log('this.instrumentInterestBearingForm.value', this.instrumentInterestBearingForm.value)
    }
    onSubmit() {
        console.warn('onSubmit()', this.instrumentInterestBearingForm.value);
        const saveInstrumentInterestBearing: InstrumentInterestBearing = {} as InstrumentInterestBearing
        saveInstrumentInterestBearing.instrument = {} as Instrument
        switch (this.crudMode) {
            case CrudEnum.ADD:
                saveInstrumentInterestBearing.instrument.name = this.instrumentInterestBearingForm.controls.name.value
                saveInstrumentInterestBearing.instrument.currency = this.instrumentInterestBearingForm.controls.currency.value
                saveInstrumentInterestBearing.instrument.ticker = this.instrumentInterestBearingForm.controls.ticker.value
                saveInstrumentInterestBearing.instrument.type = 'INTEREST_BEARING'
                saveInstrumentInterestBearing.type = this.instrumentInterestBearingForm.controls.type.value
                saveInstrumentInterestBearing.financialInstitution = this.instrumentInterestBearingForm.controls.financialInstitution.value
                saveInstrumentInterestBearing.price = this.instrumentInterestBearingForm.controls.price.value
                saveInstrumentInterestBearing.interestRate = this.instrumentInterestBearingForm.controls.interestRate.value
                saveInstrumentInterestBearing.term = this.instrumentInterestBearingForm.controls.term.value
                saveInstrumentInterestBearing.maturityDate = this.instrumentInterestBearingForm.controls.maturityDate.value
                saveInstrumentInterestBearing.nextPaymentDate = this.instrumentInterestBearingForm.controls.nextPaymentDate.value
                saveInstrumentInterestBearing.promotionalInterestRate = this.instrumentInterestBearingForm.controls.promotionalInterestRate.value
                saveInstrumentInterestBearing.promotionEndDate = this.instrumentInterestBearingForm.controls.promotionEndDate.value
                saveInstrumentInterestBearing.emailNotification = this.instrumentInterestBearingForm.controls.emailNotification.value
                console.log('saveInstrumentInterestBearing', saveInstrumentInterestBearing)
                this.restService.addInstrumentInterestBearing(saveInstrumentInterestBearing)
                    .subscribe(
                        {
                            next: (instrumentInterestBearingResponse: any) => {
                                console.log('instrumentInterestBearingResponse', instrumentInterestBearingResponse)
                                if (instrumentInterestBearingResponse.statusMessage) {
                                    this.messageService.add({ severity: 'error', summary: instrumentInterestBearingResponse.statusMessage })
                                } else {
                                    this.getInstrumentInterestBearings()
                                    this.displayDialog = false;
                                    this.sessionService.setDisableParentMessages(false)
                                    this.instrumentInterestBearingSelectedRow = {} as InstrumentInterestBearing
                                }
                            },
                            complete: () => {
                                console.log('http request completed')
                            }
                            ,
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            case CrudEnum.UPDATE:
                saveInstrumentInterestBearing.instrument.name = this.instrumentInterestBearingForm.controls.name.value
                saveInstrumentInterestBearing.instrument.currency = this.instrumentInterestBearingForm.controls.currency.value
                saveInstrumentInterestBearing.instrument.ticker = this.instrumentInterestBearingForm.controls.ticker.value
                saveInstrumentInterestBearing.instrument.type = 'INTEREST_BEARING'
                saveInstrumentInterestBearing.financialInstitution = this.instrumentInterestBearingForm.controls.financialInstitution.value
                saveInstrumentInterestBearing.type = this.instrumentInterestBearingForm.controls.type.value
                saveInstrumentInterestBearing.price = this.instrumentInterestBearingForm.controls.price.value
                saveInstrumentInterestBearing.interestRate = this.instrumentInterestBearingForm.controls.interestRate.value
                saveInstrumentInterestBearing.term = this.instrumentInterestBearingForm.controls.term.value
                saveInstrumentInterestBearing.maturityDate = this.instrumentInterestBearingForm.controls.maturityDate.value
                saveInstrumentInterestBearing.nextPaymentDate = this.instrumentInterestBearingForm.controls.nextPaymentDate.value
                saveInstrumentInterestBearing.promotionalInterestRate = this.instrumentInterestBearingForm.controls.promotionalInterestRate.value
                saveInstrumentInterestBearing.promotionEndDate = this.instrumentInterestBearingForm.controls.promotionEndDate.value
                saveInstrumentInterestBearing.emailNotification = this.instrumentInterestBearingForm.controls.emailNotification.value

                //saveInstrumentInterestBearing._links = this.instrumentInterestBearingSelectedRow._links
                saveInstrumentInterestBearing.id = this.instrumentInterestBearingSelectedRow.id;
                saveInstrumentInterestBearing.rowVersion = this.instrumentInterestBearingSelectedRow.rowVersion;
                saveInstrumentInterestBearing.instrument.id = this.instrumentInterestBearingSelectedRow.instrument.id;
                saveInstrumentInterestBearing.instrument.rowVersion = this.instrumentInterestBearingSelectedRow.instrument.rowVersion;

                console.log('saveInstrumentInterestBearing', saveInstrumentInterestBearing)
                this.restService.updateInstrumentInterestBearing(saveInstrumentInterestBearing)
                    .subscribe(
                        {
                            next: (instrumentInterestBearingResponse: any) => {
                                console.log('instrumentInterestBearingResponse', instrumentInterestBearingResponse)
                                if (instrumentInterestBearingResponse.statusMessage) {
                                    this.messageService.add({ severity: 'error', summary: instrumentInterestBearingResponse.statusMessage })
                                } else {
                                    this.getInstrumentInterestBearings()
                                    this.displayDialog = false;
                                    this.sessionService.setDisableParentMessages(false)
                                    this.instrumentInterestBearingSelectedRow = {} as InstrumentInterestBearing
                                }
                            },
                            complete: () => {
                                console.log('http request completed')
                                // this.messageService.clear()
                                // this.uploadProgressMessage = '';
                                // this.uploadResponse = {} as UploadResponse;
                                // this.messageService.add({ severity: 'info', summary: '200', detail: this.tableFileDownloadProgressMessage })
                            }
                            ,
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            case CrudEnum.DELETE:
                console.log('this.instrumentInterestBearingSelectedRow', this.instrumentInterestBearingSelectedRow)
                this.restService.deleteInstrumentInterestBearing(this.instrumentInterestBearingSelectedRow)
                    .subscribe(
                        {
                            next: (instrumentInterestBearingResponse: any) => {
                                console.log('instrumentInterestBearingResponse', instrumentInterestBearingResponse)
                                if (instrumentInterestBearingResponse.statusMessage) {
                                    this.messageService.add({ severity: 'error', summary: instrumentInterestBearingResponse.statusMessage })
                                } else {
                                    this.getInstrumentInterestBearings()
                                    this.displayDialog = false;
                                    this.sessionService.setDisableParentMessages(false)
                                    this.instrumentInterestBearingSelectedRow = {} as InstrumentInterestBearing
                                }
                            },
                            complete: () => {
                                console.log('http request completed')
                            }
                            ,
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
        this.instrumentInterestBearingForm.reset()
    }
    onCancel() {
        this.resetDialoForm();
        this.displayDialog = false;
        this.sessionService.setDisableParentMessages(false)
        this.modifyAndDeleteButtonsDisable = true
    }
    private resetDialoForm() {
        this.instrumentInterestBearingForm.reset()
        this.instrumentInterestBearingSelectedRow = {} as InstrumentInterestBearing
    }

    onChangeType(event: any) {
        console.log('onChangeType: event', event)
        this.instrumentInterestBearingForm.controls.ticker.reset();
        this.instrumentInterestBearingForm.controls.price.reset();
        this.instrumentInterestBearingForm.controls.interestRate.reset();
        this.instrumentInterestBearingForm.controls.term.reset();
        this.instrumentInterestBearingForm.controls.maturityDate.reset();
        this.instrumentInterestBearingForm.controls.nextPaymentDate.reset();
        this.instrumentInterestBearingForm.controls.promotionalInterestRate.reset();
        this.instrumentInterestBearingForm.controls.promotionEndDate.reset();
        this.instrumentInterestBearingForm.controls.emailNotification.patchValue(true);
    }
    onChangeFinancialInstitution(event: any) {
        console.log('onChangeFinancialInstitution: event', event)
    }
    onChangeTerm(event: any) {
        console.log('onChangeTerm: event', event)
    }
    onSelectMaturityDate(value: string) {
        console.log('onSelectMaturityDate: value', value)
        if (!this.instrumentInterestBearingForm.controls.nextPaymentDate.value) {
            this.instrumentInterestBearingForm.controls.nextPaymentDate.patchValue(new Date(value))
        }
    }
    onInputPrice(event: any) {
        this.instrumentInterestBearingForm.controls.price.patchValue(event.value)
        console.log('this.instrumentInterestBearingForm.valid', this.instrumentInterestBearingForm.valid)
    }
    onInputInterestRate(event: any) {
        this.instrumentInterestBearingForm.controls.interestRate.patchValue(event.value)
        console.log('this.instrumentInterestBearingForm.valid', this.instrumentInterestBearingForm.valid)
    }
    onPromotionalInputInterestRate(event: any) {
        this.instrumentInterestBearingForm.controls.promotionalInterestRate.patchValue(event.value)
        console.log('this.instrumentInterestBearingForm.valid', this.instrumentInterestBearingForm.valid)
    }


    private getCurrencies() {
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
    private getFinancialInstitutions() {
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
    private getInstrumentTypes() {
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
    private getInterestBearingTypes() {
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
    private getTerms() {
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

    private extractMessage(httpErrorResponse: HttpErrorResponse): string {
        let message: string = ''
        if (typeof httpErrorResponse.error === 'string') {
            message = httpErrorResponse.error
        } else {
            message = httpErrorResponse.error.message
        }
        return message;
    }
}
