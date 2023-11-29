import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RestService } from '../../../service/rest.service';
import { SessionService } from '../../../service/session.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CrudEnum } from '../../../crud-enum';
import { InstrumentBond } from '../InstrumentBond';
import { InstrumentMaintenanceComponent } from '../instrument-maintenance.component';
import { Instrument } from '../../portfolio-holding-management/Instrument';

@Component({
    selector: 'app-bond',
    templateUrl: './bond.component.html',
    styleUrls: ['./bond.component.css']
})
export class BondComponent extends InstrumentMaintenanceComponent implements OnInit {

    @Input() instrumentType: string = ''

    currencies: Array<string> = []
    holderOptions: Array<{ value: string, name: string }> = []
    instrumentTypes: Array<string> = []
    termOptions: Array<{ value: string, name: string }> = []

    instrumentBonds: InstrumentBond[] | null = null;
    loadingStatus: boolean = false;
    instrumentBondCount: number = 0;
    instrumentBondSelectedRow: InstrumentBond = {} as InstrumentBond;
    modifyAndDeleteButtonsDisable: boolean = true;
    crudMode: CrudEnum = {} as CrudEnum
    crudEnum = CrudEnum; // Used in html to refer to enum
    displayDialog: boolean = false

    instrumentBondForm = this.formBuilder.nonNullable.group({
        name: ['', Validators.required],
        currency: ['', Validators.required],
        issuer: ['', Validators.required],
        cusip: ['', Validators.required],
        price: this.formBuilder.control<number | null>(null),
        coupon: this.formBuilder.control<number | null>(null),
        issueDate: this.formBuilder.control<Date | null>(null),
        maturityDate: this.formBuilder.control<Date | null>(null),
        paymentFrequency: ['', Validators.required],
        nextPaymentDate: this.formBuilder.control<Date | null>(null),
        notes: this.formBuilder.control<string | null>(null),
        emailNotification: [true, Validators.required],
    })

    constructor(
        private _restService: RestService,
        private _messageService: MessageService,
        private formBuilder: FormBuilder,
        private sessionService: SessionService
    ) {
        super(_restService, _messageService)
    }

    ngOnInit(): void {
        this.getCurrencies()
        this.getInstrumentTypes()
        this.getPaymentFrequencies()
        // this.getTerms()
        //this.getHolders()
        //this.getRegisteredAccounts()

        this.getInstrumentBonds()
    }

    private getInstrumentBonds() {
        const tableName: string = 'instrument_bond'
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        this.restService.getTableData(tableName, 0, 999, [], 'instrumentBondInlineInstrument')
            .subscribe(
                {
                    next: (data: any) => {
                        this.instrumentBonds = data._embedded[entityNameResource]
                        this.transformInstrumentBondDateFields()
                        console.log('this.instrumentBonds', this.instrumentBonds)
                        this.instrumentBondCount = data.page.totalElements
                    },
                    complete: () => {
                        console.log('http request completed')
                        // sort by instrument name
                        // this cannot be done by jpa data rest becuase does not support sort by assosiation columns
                        this.instrumentBonds!.sort((a, b) => (a.instrument.name! < b.instrument.name!) ? -1 : (a.instrument.name! > b.instrument.name!) ? 1 : 0)
                        this.loadingStatus = false
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }
    private transformInstrumentBondDateFields() {
        this.instrumentBonds!.forEach(instrumentBond => {
            // convert ISO8601 date to Date object
            instrumentBond.maturityDate = instrumentBond.maturityDate ? new Date(instrumentBond.maturityDate) : null
            instrumentBond.issueDate = instrumentBond.issueDate ? new Date(instrumentBond.issueDate) : null
            instrumentBond.nextPaymentDate = instrumentBond.nextPaymentDate ? new Date(instrumentBond.nextPaymentDate) : null
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
                this.instrumentBondForm.controls.emailNotification.patchValue(true);
                this.instrumentBondForm.enable();
                break;
            case CrudEnum.UPDATE:
                this.fillInFormWithValues();
                this.instrumentBondForm.enable();
                //this.setValidators(this.instrumentBondSelectedRow.type);
                break;
            case CrudEnum.DELETE:
                this.fillInFormWithValues();
                this.instrumentBondForm.disable();
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
    }
    private fillInFormWithValues(): void {
        console.log('this.instrumentBondSelectedRow', this.instrumentBondSelectedRow)
        this.instrumentBondForm.controls.name.patchValue(this.instrumentBondSelectedRow.instrument.name);
        // lookup instrument object from instrumentRows (table)
        this.instrumentBondForm.controls.currency.patchValue(this.instrumentBondSelectedRow.instrument.currency);
        this.instrumentBondForm.controls.notes.patchValue(this.instrumentBondSelectedRow.instrument.notes);

        this.instrumentBondForm.controls.issuer.patchValue(this.instrumentBondSelectedRow.issuer);
        this.instrumentBondForm.controls.cusip.patchValue(this.instrumentBondSelectedRow.cusip);
        this.instrumentBondForm.controls.price.patchValue(this.instrumentBondSelectedRow.price);
        this.instrumentBondForm.controls.coupon.patchValue(this.instrumentBondSelectedRow.coupon);
        this.instrumentBondForm.controls.issueDate.patchValue(this.instrumentBondSelectedRow.issueDate);
        this.instrumentBondForm.controls.maturityDate.patchValue(this.instrumentBondSelectedRow.maturityDate);
        this.instrumentBondForm.controls.paymentFrequency.patchValue(this.instrumentBondSelectedRow.paymentFrequency);
        this.instrumentBondForm.controls.nextPaymentDate.patchValue(this.instrumentBondSelectedRow.nextPaymentDate);
        this.instrumentBondForm.controls.emailNotification.patchValue(this.instrumentBondSelectedRow.emailNotification);
        console.log('this.instrumentBondForm.value', this.instrumentBondForm.value)
    }

    onSubmit() {
        console.warn('onSubmit()', this.instrumentBondForm.value);
        const saveInstrumentBond: InstrumentBond = {} as InstrumentBond
        saveInstrumentBond.instrument = {} as Instrument
        switch (this.crudMode) {
            case CrudEnum.ADD:
                saveInstrumentBond.instrument.name = this.instrumentBondForm.controls.name.value
                saveInstrumentBond.instrument.currency = this.instrumentBondForm.controls.currency.value
                saveInstrumentBond.issuer = this.instrumentBondForm.controls.issuer.value
                saveInstrumentBond.cusip = this.instrumentBondForm.controls.cusip.value
                saveInstrumentBond.price = this.instrumentBondForm.controls.price.value
                saveInstrumentBond.coupon = this.instrumentBondForm.controls.coupon.value
                saveInstrumentBond.issueDate = this.instrumentBondForm.controls.issueDate.value
                saveInstrumentBond.maturityDate = this.instrumentBondForm.controls.maturityDate.value
                saveInstrumentBond.paymentFrequency = this.instrumentBondForm.controls.paymentFrequency.value
                saveInstrumentBond.nextPaymentDate = this.instrumentBondForm.controls.nextPaymentDate.value
                saveInstrumentBond.emailNotification = this.instrumentBondForm.controls.emailNotification.value
                saveInstrumentBond.instrument.notes = this.instrumentBondForm.controls.notes.value
                console.log('saveInstrumentBond', saveInstrumentBond)
                this.restService.saveInstrumentBond(saveInstrumentBond)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getInstrumentBonds()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.instrumentBondSelectedRow = {} as InstrumentBond
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                console.log('httpErrorResponse', httpErrorResponse)
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            case CrudEnum.UPDATE:
                saveInstrumentBond.instrument.name = this.instrumentBondForm.controls.name.value
                saveInstrumentBond.instrument.currency = this.instrumentBondForm.controls.currency.value
                saveInstrumentBond.issuer = this.instrumentBondForm.controls.issuer.value
                saveInstrumentBond.cusip = this.instrumentBondForm.controls.cusip.value
                saveInstrumentBond.price = this.instrumentBondForm.controls.price.value
                saveInstrumentBond.coupon = this.instrumentBondForm.controls.coupon.value
                saveInstrumentBond.issueDate = this.instrumentBondForm.controls.issueDate.value
                saveInstrumentBond.maturityDate = this.instrumentBondForm.controls.maturityDate.value
                saveInstrumentBond.paymentFrequency = this.instrumentBondForm.controls.paymentFrequency.value
                saveInstrumentBond.nextPaymentDate = this.instrumentBondForm.controls.nextPaymentDate.value
                saveInstrumentBond.emailNotification = this.instrumentBondForm.controls.emailNotification.value
                saveInstrumentBond.instrument.notes = this.instrumentBondForm.controls.notes.value

                saveInstrumentBond.id = this.instrumentBondSelectedRow.id;
                saveInstrumentBond.rowVersion = this.instrumentBondSelectedRow.rowVersion;
                saveInstrumentBond.instrument.id = this.instrumentBondSelectedRow.instrument.id;
                saveInstrumentBond.instrument.rowVersion = this.instrumentBondSelectedRow.instrument.rowVersion;

                console.log('saveInstrumentBond', saveInstrumentBond)
                this.restService.saveInstrumentBond(saveInstrumentBond)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getInstrumentBonds()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.instrumentBondSelectedRow = {} as InstrumentBond
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            case CrudEnum.DELETE:
                console.log('this.instrumentBondSelectedRow', this.instrumentBondSelectedRow)
                this.restService.deleteInstrumentBond(this.instrumentBondSelectedRow)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getInstrumentBonds()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.instrumentBondSelectedRow = {} as InstrumentBond
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
        this.instrumentBondForm.reset()
        this.modifyAndDeleteButtonsDisable = true
    }

    onCancel() {
        this.resetDialoForm();
        this.displayDialog = false;
        this.sessionService.setDisableParentMessages(false)
        this.modifyAndDeleteButtonsDisable = true
    }
    private resetDialoForm() {
        this.instrumentBondForm.reset()
        this.instrumentBondSelectedRow = {} as InstrumentBond
    }

    onSelectIssueDate(value: string) {
        console.log('onSelectIssueDate: value', value)
        if (this.checkDates()) {
            this.instrumentBondForm.controls.issueDate.setErrors({ 'invalidDate': true });
        } else {
            this.instrumentBondForm.controls.nextPaymentDate.setErrors(null);
            this.instrumentBondForm.controls.maturityDate.setErrors(null);
        }
    }
    onSelectNextPaymentDate(value: string) {
        console.log('onSelectNextPaymentDate: value', value)
        if (!this.instrumentBondForm.controls.maturityDate.value) {
            this.instrumentBondForm.controls.maturityDate.patchValue(new Date(value))
        }
        if (this.checkDates()) {
            this.instrumentBondForm.controls.nextPaymentDate.setErrors({ 'invalidDate': true });
        } else {
            this.instrumentBondForm.controls.issueDate.setErrors(null);
            this.instrumentBondForm.controls.maturityDate.setErrors(null);
        }
    }
    onSelectMaturityDate(value: string) {
        console.log('onSelectMaturityDate: value', value)
        if (this.checkDates()) {
            this.instrumentBondForm.controls.maturityDate.setErrors({ 'invalidDate': true });
        } else {
            this.instrumentBondForm.controls.issueDate.setErrors(null);
            this.instrumentBondForm.controls.nextPaymentDate.setErrors(null);
        }
    }
    private checkDates() {
        return (! /* not */ (this.instrumentBondForm.controls.issueDate.value!.getTime() < this.instrumentBondForm.controls.nextPaymentDate.value!.getTime() && this.instrumentBondForm.controls.nextPaymentDate.value!.getTime() <= this.instrumentBondForm.controls.maturityDate.value!.getTime()))
    }
    onInputPrice(event: any) {
        console.log('this.instrumentBondForm.value', this.instrumentBondForm.value)
        if (event.value < 0.0001) {
            this.instrumentBondForm.controls.price.setErrors({ 'error': true });
        }
        console.log('this.instrumentBondForm.valid', this.instrumentBondForm.valid)
    }
    onInputCoupon(event: any) {
        if (event.value < 0.0001) {
            this.instrumentBondForm.controls.coupon.setErrors({ 'error': true });
        }
        console.log('this.instrumentBondForm.valid', this.instrumentBondForm.valid)
    }

}
