import { Component, OnInit } from '@angular/core';
import { RestService } from '../../service/rest.service';
import { MessageService } from 'primeng/api';
import { InstrumentInterestBearing } from '../portfolio-management/InstrumentInterestBearing';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { CrudEnum } from '../../crud-enum';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { Instrument } from '../portfolio-management/Instrument';

@Component({
    selector: 'app-instrument-management',
    templateUrl: './instrument-management.component.html',
    styleUrls: ['./instrument-management.component.css']
})
export class InstrumentManagementComponent implements OnInit {

    currencies: Array<string> = []
    financialInstitutions: Array<string> = []
    instrumentTypes: Array<string> = []
    interestBearingTypes: Array<string> = []
    terms: Array<string> = []

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
        //ticker: ['', Validators.required],
        type: ['', Validators.required],
        financialInstitution: [''],
        price: this.formBuilder.control<number | null>(null),
        interestRate: this.formBuilder.control<number | null>(null, Validators.required),
        term: this.formBuilder.control<string | null>(null),
        maturityDate: this.formBuilder.control<Date | null>(null),
        promotionalInterestRate: this.formBuilder.control<number | null>(null),
        promotionEndDate: this.formBuilder.control<Date | null>(null),
        emailNotification: this.formBuilder.control<boolean | null>(true, Validators.required)
    })

    constructor(
        private restService: RestService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,

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
        this.restService.getTableData(tableName, 0, 999, [], 'interestBearingWithAssociations')
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
                        // this cannot be done by jpa data rest becuase does ot support sort by assosiation columns
                        this.instrumentInterestBearings!.sort((a, b) => (a.instrument.name! < b.instrument.name!) ? -1 : (a.instrument.name! > b.instrument.name!) ? 1 : 0)
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                    }
                });
    }

    private transformInstrumentInterestBearingsDateFields() {
        this.instrumentInterestBearings!.forEach(instrumentInterestBearing => {
            const maturityDate = instrumentInterestBearing.maturityDate
            // convert ISO8601 date to Date object
            instrumentInterestBearing.maturityDate = instrumentInterestBearing.maturityDate ? new Date(instrumentInterestBearing.maturityDate) : null
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
        //this.instrumentInterestBearingForm.controls.ticker.patchValue(this.instrumentInterestBearingSelectedRow.instrument.ticker);

        this.instrumentInterestBearingForm.controls.type.patchValue(this.instrumentInterestBearingSelectedRow.type);
        this.instrumentInterestBearingForm.controls.financialInstitution.patchValue(this.instrumentInterestBearingSelectedRow.financialInstitution);
        this.instrumentInterestBearingForm.controls.price.patchValue(this.instrumentInterestBearingSelectedRow.price);
        this.instrumentInterestBearingForm.controls.interestRate.patchValue(this.instrumentInterestBearingSelectedRow.interestRate);
        this.instrumentInterestBearingForm.controls.term.patchValue(this.instrumentInterestBearingSelectedRow.term);
        this.instrumentInterestBearingForm.controls.maturityDate.patchValue(this.instrumentInterestBearingSelectedRow.maturityDate);
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
                //saveInstrumentInterestBearing.instrument.ticker = this.instrumentInterestBearingForm.controls.ticker.value
                saveInstrumentInterestBearing.instrument.type = 'INTEREST_BEARING'
                saveInstrumentInterestBearing.type = this.instrumentInterestBearingForm.controls.type.value
                saveInstrumentInterestBearing.financialInstitution = this.instrumentInterestBearingForm.controls.financialInstitution.value
                saveInstrumentInterestBearing.price = this.instrumentInterestBearingForm.controls.price.value ? this.instrumentInterestBearingForm.controls.price.value : 1
                saveInstrumentInterestBearing.interestRate = this.instrumentInterestBearingForm.controls.interestRate.value
                saveInstrumentInterestBearing.term = this.instrumentInterestBearingForm.controls.term.value
                saveInstrumentInterestBearing.maturityDate = this.instrumentInterestBearingForm.controls.maturityDate.value
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
                                    this.instrumentInterestBearingSelectedRow = {} as InstrumentInterestBearing
                                }
                            },
                            complete: () => {
                                console.log('http request completed')
                            }
                            ,
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support. ' })
                            }
                        });
                break;
            case CrudEnum.UPDATE:
                saveInstrumentInterestBearing.instrument.name = this.instrumentInterestBearingForm.controls.name.value
                saveInstrumentInterestBearing.instrument.currency = this.instrumentInterestBearingForm.controls.currency.value
                //saveInstrumentInterestBearing.instrument.ticker = this.instrumentInterestBearingForm.controls.ticker.value
                saveInstrumentInterestBearing.instrument.type = 'INTEREST_BEARING'
                saveInstrumentInterestBearing.financialInstitution = this.instrumentInterestBearingForm.controls.financialInstitution.value
                saveInstrumentInterestBearing.type = this.instrumentInterestBearingForm.controls.type.value
                saveInstrumentInterestBearing.price = this.instrumentInterestBearingForm.controls.price.value
                saveInstrumentInterestBearing.interestRate = this.instrumentInterestBearingForm.controls.interestRate.value
                saveInstrumentInterestBearing.term = this.instrumentInterestBearingForm.controls.term.value
                saveInstrumentInterestBearing.maturityDate = this.instrumentInterestBearingForm.controls.maturityDate.value
                saveInstrumentInterestBearing.promotionalInterestRate = this.instrumentInterestBearingForm.controls.promotionalInterestRate.value
                saveInstrumentInterestBearing.promotionEndDate = this.instrumentInterestBearingForm.controls.promotionEndDate.value
                saveInstrumentInterestBearing.emailNotification = this.instrumentInterestBearingForm.controls.emailNotification.value

                saveInstrumentInterestBearing._links = this.instrumentInterestBearingSelectedRow._links

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
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support. ' })
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
                                    this.instrumentInterestBearingSelectedRow = {} as InstrumentInterestBearing
                                }
                            },
                            complete: () => {
                                console.log('http request completed')
                            }
                            ,
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
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
        this.modifyAndDeleteButtonsDisable = true
    }
    private resetDialoForm() {
        this.instrumentInterestBearingForm.reset()
        this.instrumentInterestBearingSelectedRow = {} as InstrumentInterestBearing
    }

    onChangeType(event: any) {
        console.log('onChangeType: event', event)
    }
    onChangeFinancialInstitution(event: any) {
        console.log('onChangeFinancialInstitution: event', event)
    }
    onChangeTerm(event: any) {
        console.log('onChangeTerm: event', event)
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
                    error: (response: any) => {
                        this.messageService.add({ severity: 'error', summary: response, detail: response })
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
                    error: (response: any) => {
                        this.messageService.add({ severity: 'error', summary: response, detail: response })
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
                    error: (response: any) => {
                        this.messageService.add({ severity: 'error', summary: response, detail: response })
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
                    error: (response: any) => {
                        this.messageService.add({ severity: 'error', summary: response, detail: response })
                    }
                });
    }
    private getTerms() {
        this.restService.getTerms()
            .subscribe(
                {
                    next: (data: Array<string>) => {
                        console.log('data', data)
                        this.terms = data
                    },
                    complete: () => {
                        console.log('http request completed')
                    },
                    error: (response: any) => {
                        this.messageService.add({ severity: 'error', summary: response, detail: response })
                    }
                });
    }
}
