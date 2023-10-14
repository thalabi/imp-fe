import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CrudEnum } from '../../crud-enum';
import { RestService } from '../../service/rest.service';
import { InstrumentInterestBearing } from './InstrumentInterestBearing';
import { HttpErrorResponse } from '@angular/common/http';
import { Instrument } from '../portfolio-holding-management/Instrument';
import { SessionService } from '../../service/session.service';
import { BaseComponent } from '../../base/base.component';
import { HolderAndName } from '../portfolio-maintenance/HolderAndName';
import { Table } from 'primeng/table';

@Component({
    selector: 'app-instrument-maintenance',
    templateUrl: './instrument-maintenance.component.html',
    styleUrls: ['./instrument-maintenance.component.css']
})
export class InstrumentMaintenanceComponent extends BaseComponent implements OnInit {

    currencies: Array<string> = []
    financialInstitutions: Array<string> = []
    holderOptions: Array<{ value: string, name: string }> = []
    instrumentTypes: Array<string> = []
    interestBearingTypes: Array<string> = []
    termOptions: Array<{ value: string, name: string }> = []
    registeredAccountOptions: Array<{ value: string | null, name: string }> = []

    selectedInstrumentType: string = ''
    instrumentInterestBearings: InstrumentInterestBearing[] | null = null;
    loadingStatus: boolean = false;
    instrumentInterestBearingCount: number = 0;
    instrumentInterestBearingSelectedRow: InstrumentInterestBearing = {} as InstrumentInterestBearing;
    modifyAndDeleteButtonsDisable: boolean = true;
    crudMode: CrudEnum = {} as CrudEnum
    crudEnum = CrudEnum; // Used in html to refer to enum
    displayDialog: boolean = false

    instrumentInterestBearingForm = this.formBuilder.nonNullable.group({
        name: ['', Validators.required],
        currency: ['', Validators.required],
        financialInstitution: ['', Validators.required],
        type: ['', Validators.required],
        ticker: [''],
        price: this.formBuilder.control<number | null>(null),
        interestRate: this.formBuilder.control<number | null>(null),
        term: this.formBuilder.control<string | null>(null),
        maturityDate: this.formBuilder.control<Date | null>(null),
        nextPaymentDate: this.formBuilder.control<Date | null>(null),
        promotionalInterestRate: this.formBuilder.control<number | null>(null),
        promotionEndDate: this.formBuilder.control<Date | null>(null),
        notes: this.formBuilder.control<string | null>(null),
        emailNotification: [true, Validators.required],
        accountNumber: this.formBuilder.control<string | null>(null),
        holder: this.formBuilder.control<string | null>(null),
        registeredAccount: this.formBuilder.control<string | null>(null)
    })

    constructor(
        private restService: RestService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private sessionService: SessionService
    ) {
        super()
    }


    ngOnInit(): void {
        this.getCurrencies()
        this.getFinancialInstitutions()
        this.getInstrumentTypes()
        this.getInterestBearingTypes()
        this.getTerms()
        this.getHolders()
        this.getRegisteredAccounts()

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
                    },
                    complete: () => {
                        console.log('http request completed')
                        // sort by instrument name
                        // this cannot be done by jpa data rest becuase does not support sort by assosiation columns
                        this.instrumentInterestBearings!.sort((a, b) => (a.instrument.name! < b.instrument.name!) ? -1 : (a.instrument.name! > b.instrument.name!) ? 1 : 0)
                        this.loadingStatus = false
                    },
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
        this.modifyAndDeleteButtonsDisable = false;
    }
    onRowUnselect(event: any) {
        console.log(event);
        this.modifyAndDeleteButtonsDisable = true;
    }

    showDialog(crudMode: CrudEnum) {
        this.displayDialog = true;
        this.sessionService.setDisableParentMessages(true)
        this.crudMode = crudMode;
        console.log('this.crudMode', this.crudMode);
        switch (this.crudMode) {
            case CrudEnum.ADD:
                // this.resetDialoForm();
                this.instrumentInterestBearingForm.controls.emailNotification.patchValue(true);
                this.instrumentInterestBearingForm.enable();
                break;
            case CrudEnum.UPDATE:
                this.fillInFormWithValues();
                this.instrumentInterestBearingForm.enable();
                this.setValidators(this.instrumentInterestBearingSelectedRow.type);
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
        this.instrumentInterestBearingForm.controls.notes.patchValue(this.instrumentInterestBearingSelectedRow.instrument.notes);

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
        this.instrumentInterestBearingForm.controls.accountNumber.patchValue(this.instrumentInterestBearingSelectedRow.accountNumber);
        this.instrumentInterestBearingForm.controls.holder.patchValue(this.instrumentInterestBearingSelectedRow.holder);
        this.instrumentInterestBearingForm.controls.registeredAccount.patchValue(this.instrumentInterestBearingSelectedRow.registeredAccount);
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
                saveInstrumentInterestBearing.instrument.notes = this.instrumentInterestBearingForm.controls.notes.value
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
                saveInstrumentInterestBearing.accountNumber = this.instrumentInterestBearingForm.controls.accountNumber.value
                saveInstrumentInterestBearing.holder = this.instrumentInterestBearingForm.controls.holder.value
                saveInstrumentInterestBearing.registeredAccount = this.instrumentInterestBearingForm.controls.registeredAccount.value
                console.log('saveInstrumentInterestBearing', saveInstrumentInterestBearing)
                this.restService.saveInstrumentInterestBearing(saveInstrumentInterestBearing)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getInstrumentInterestBearings()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.instrumentInterestBearingSelectedRow = {} as InstrumentInterestBearing
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                console.log('httpErrorResponse', httpErrorResponse)
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            case CrudEnum.UPDATE:
                saveInstrumentInterestBearing.instrument.name = this.instrumentInterestBearingForm.controls.name.value
                saveInstrumentInterestBearing.instrument.currency = this.instrumentInterestBearingForm.controls.currency.value
                saveInstrumentInterestBearing.instrument.ticker = this.instrumentInterestBearingForm.controls.ticker.value
                saveInstrumentInterestBearing.instrument.type = 'INTEREST_BEARING'
                saveInstrumentInterestBearing.instrument.notes = this.instrumentInterestBearingForm.controls.notes.value
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
                saveInstrumentInterestBearing.accountNumber = this.instrumentInterestBearingForm.controls.accountNumber.value
                saveInstrumentInterestBearing.holder = this.instrumentInterestBearingForm.controls.holder.value
                saveInstrumentInterestBearing.registeredAccount = this.instrumentInterestBearingForm.controls.registeredAccount.value

                saveInstrumentInterestBearing.id = this.instrumentInterestBearingSelectedRow.id;
                saveInstrumentInterestBearing.rowVersion = this.instrumentInterestBearingSelectedRow.rowVersion;
                saveInstrumentInterestBearing.instrument.id = this.instrumentInterestBearingSelectedRow.instrument.id;
                saveInstrumentInterestBearing.instrument.rowVersion = this.instrumentInterestBearingSelectedRow.instrument.rowVersion;

                console.log('saveInstrumentInterestBearing', saveInstrumentInterestBearing)
                this.restService.saveInstrumentInterestBearing(saveInstrumentInterestBearing)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getInstrumentInterestBearings()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.instrumentInterestBearingSelectedRow = {} as InstrumentInterestBearing
                            },
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
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getInstrumentInterestBearings()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.instrumentInterestBearingSelectedRow = {} as InstrumentInterestBearing
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
        this.instrumentInterestBearingForm.reset()
        this.modifyAndDeleteButtonsDisable = true
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
        this.instrumentInterestBearingForm.controls.accountNumber.reset();
        this.instrumentInterestBearingForm.controls.holder.reset();
        this.instrumentInterestBearingForm.controls.registeredAccount.reset();

        this.setValidators(event.value);
    }

    private setValidators(interestBearingType: string) {
        console.log('interestBearingType', interestBearingType)
        switch (interestBearingType) {
            case 'MONEY_MARKET':
            case 'INVESTMENT_SAVINGS':
                this.instrumentInterestBearingForm.controls.ticker.addValidators(Validators.required)
                this.instrumentInterestBearingForm.controls.price.addValidators(Validators.required)
                this.instrumentInterestBearingForm.controls.interestRate.addValidators(Validators.required)
                this.instrumentInterestBearingForm.controls.term.clearValidators()
                this.instrumentInterestBearingForm.controls.maturityDate.clearValidators()
                this.instrumentInterestBearingForm.controls.nextPaymentDate.clearValidators()
                this.instrumentInterestBearingForm.controls.promotionalInterestRate.clearValidators()
                this.instrumentInterestBearingForm.controls.promotionEndDate.clearValidators()
                this.instrumentInterestBearingForm.controls.accountNumber.clearValidators()
                this.instrumentInterestBearingForm.controls.holder.clearValidators()
                break;
            case 'CHEQUING':
            case 'SAVINGS':
                this.instrumentInterestBearingForm.controls.ticker.clearValidators()
                this.instrumentInterestBearingForm.controls.price.clearValidators()
                this.instrumentInterestBearingForm.controls.interestRate.addValidators(Validators.required)
                this.instrumentInterestBearingForm.controls.term.clearValidators()
                this.instrumentInterestBearingForm.controls.maturityDate.clearValidators()
                this.instrumentInterestBearingForm.controls.nextPaymentDate.clearValidators()
                this.instrumentInterestBearingForm.controls.promotionalInterestRate.clearValidators()
                this.instrumentInterestBearingForm.controls.promotionEndDate.clearValidators()
                this.instrumentInterestBearingForm.controls.accountNumber.addValidators(Validators.required)
                this.instrumentInterestBearingForm.controls.holder.addValidators(Validators.required)
                break;
            case 'GIC':
            case 'TERM_DEPOSIT':
                this.instrumentInterestBearingForm.controls.ticker.clearValidators()
                this.instrumentInterestBearingForm.controls.price.clearValidators()
                this.instrumentInterestBearingForm.controls.interestRate.addValidators(Validators.required)
                this.instrumentInterestBearingForm.controls.term.addValidators(Validators.required)
                this.instrumentInterestBearingForm.controls.maturityDate.addValidators(Validators.required)
                this.instrumentInterestBearingForm.controls.nextPaymentDate.addValidators(Validators.required)
                this.instrumentInterestBearingForm.controls.promotionalInterestRate.clearValidators()
                this.instrumentInterestBearingForm.controls.promotionEndDate.clearValidators()
                this.instrumentInterestBearingForm.controls.accountNumber.addValidators(Validators.required)
                this.instrumentInterestBearingForm.controls.holder.addValidators(Validators.required)
                break;
        }
        this.instrumentInterestBearingForm.controls.ticker.updateValueAndValidity()
        this.instrumentInterestBearingForm.controls.price.updateValueAndValidity()
        this.instrumentInterestBearingForm.controls.interestRate.updateValueAndValidity()
        this.instrumentInterestBearingForm.controls.term.updateValueAndValidity()
        this.instrumentInterestBearingForm.controls.maturityDate.updateValueAndValidity()
        this.instrumentInterestBearingForm.controls.nextPaymentDate.updateValueAndValidity()
        this.instrumentInterestBearingForm.controls.promotionalInterestRate.updateValueAndValidity()
        this.instrumentInterestBearingForm.controls.promotionEndDate.updateValueAndValidity()
        this.instrumentInterestBearingForm.controls.accountNumber.updateValueAndValidity()
        this.instrumentInterestBearingForm.controls.holder.updateValueAndValidity()
    }

    // onChangeFinancialInstitution(event: any) {
    //     console.log('onChangeFinancialInstitution: event', event)
    // }
    // onChangeTerm(event: any) {
    //     console.log('onChangeTerm: event', event)
    // }
    // onChangeHolder(event: any) {
    //     console.log('onChangeHolder: event', event)
    // }
    // onChangeRegisteredAccount(event: any) {
    //     console.log('onChangeRegisteredAccount: event', event)
    // }

    onSelectMaturityDate(value: string) {
        console.log('onSelectMaturityDate: value', value)
        if (!this.instrumentInterestBearingForm.controls.nextPaymentDate.value) {
            this.instrumentInterestBearingForm.controls.nextPaymentDate.patchValue(new Date(value))
        }
    }
    onInputPrice(event: any) {
        if (event.value < 0.0001) {
            this.instrumentInterestBearingForm.controls.price.setErrors({ 'error': true });
        }
        console.log('this.instrumentInterestBearingForm.valid', this.instrumentInterestBearingForm.valid)
    }
    onInputInterestRate(event: any) {
        if (event.value < 0.01) {
            this.instrumentInterestBearingForm.controls.interestRate.setErrors({ 'error': true });
        }
        console.log('this.instrumentInterestBearingForm.valid', this.instrumentInterestBearingForm.valid)
    }
    onPromotionalInputInterestRate(event: any) {
        if (event.value !== null && event.value < 0.01) {
            this.instrumentInterestBearingForm.controls.promotionalInterestRate.setErrors({ 'error': true });
        }
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

    private getHolders() {
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

    private getRegisteredAccounts() {
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


    @ViewChild('dt') dt: Table = {} as Table;
    // Hack to wrap filterGlobal and be able to specify type HTMLInputElement
    applyFilterGlobal($event: any, stringVal: any) {
        this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
    }
}
