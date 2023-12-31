import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RestService } from '../../../service/rest.service';
import { SessionService } from '../../../service/session.service';
import { InstrumentMaintenanceComponent } from '../instrument-maintenance.component';
import { InstrumentMutualFund } from './InstrumentMutualFund';
import { CrudEnum } from '../../../crud-enum';
import { Instrument } from '../../portfolio-holding-management/Instrument';

@Component({
    selector: 'app-mutual-fund',
    templateUrl: './mutual-fund.component.html',
    styleUrls: ['./mutual-fund.component.css']
})
export class MutualFundComponent extends InstrumentMaintenanceComponent implements OnInit {

    @Input() instrumentType: string = ''

    loadingStatus: boolean = false;
    instrumentMutualFunds: InstrumentMutualFund[] | null = null;
    instrumentMutualFundCount: number = 0;
    instrumentMutualFundSelectedRow: InstrumentMutualFund = {} as InstrumentMutualFund;
    modifyAndDeleteButtonsDisable: boolean = true;
    crudMode: CrudEnum = {} as CrudEnum
    crudEnum = CrudEnum; // Used in html to refer to enum
    displayDialog: boolean = false

    instrumentMutualFundForm = this.formBuilder.nonNullable.group({
        name: ['', Validators.required],
        currency: ['', Validators.required],
        ticker: ['', Validators.required],
        company: ['', Validators.required],
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
        //this.getInstrumentTypes()
        //this.getPaymentFrequencies()
        // this.getTerms()
        //this.getHolders()
        //this.getRegisteredAccounts()

        this.getInstrumentMutualFunds()
    }
    private getInstrumentMutualFunds() {
        const tableName: string = 'instrument_mutual_fund'
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        this.restService.getTableData(tableName, 0, 999, [], 'instrumentMutualFundInlineInstrument')
            .subscribe(
                {
                    next: (data: any) => {
                        this.instrumentMutualFunds = data._embedded[entityNameResource]
                        //this.transformInstrumentBondDateFields()
                        console.log('this.instrumentMutualFunds', this.instrumentMutualFunds)
                        this.instrumentMutualFundCount = data.page.totalElements
                    },
                    complete: () => {
                        console.log('http request completed')
                        // sort by instrument name
                        // this cannot be done by jpa data rest becuase does not support sort by assosiation columns
                        this.instrumentMutualFunds!.sort((a, b) => (a.instrument.name! < b.instrument.name!) ? -1 : (a.instrument.name! > b.instrument.name!) ? 1 : 0)
                        this.loadingStatus = false
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
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
                this.instrumentMutualFundForm.enable();
                break;
            case CrudEnum.UPDATE:
                this.fillInFormWithValues();
                this.instrumentMutualFundForm.enable();
                //this.setValidators(this.instrumentMutualFundSelectedRow.type);
                break;
            case CrudEnum.DELETE:
                this.fillInFormWithValues();
                this.instrumentMutualFundForm.disable();
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
    }
    private fillInFormWithValues(): void {
        console.log('this.instrumentMutualFundSelectedRow', this.instrumentMutualFundSelectedRow)
        this.instrumentMutualFundForm.controls.name.patchValue(this.instrumentMutualFundSelectedRow.instrument.name);
        // lookup instrument object from instrumentRows (table)
        this.instrumentMutualFundForm.controls.currency.patchValue(this.instrumentMutualFundSelectedRow.instrument.currency);
        this.instrumentMutualFundForm.controls.ticker.patchValue(this.instrumentMutualFundSelectedRow.instrument.ticker);
        this.instrumentMutualFundForm.controls.company.patchValue(this.instrumentMutualFundSelectedRow.company);

        console.log('this.instrumentMutualFundForm.value', this.instrumentMutualFundForm.value)
    }

    onSubmit() {
        console.warn('onSubmit()', this.instrumentMutualFundForm.value);
        const saveInstrumentMutualFund: InstrumentMutualFund = {} as InstrumentMutualFund
        saveInstrumentMutualFund.instrument = {} as Instrument
        switch (this.crudMode) {
            case CrudEnum.ADD:
                saveInstrumentMutualFund.instrument.name = this.instrumentMutualFundForm.controls.name.value
                saveInstrumentMutualFund.instrument.currency = this.instrumentMutualFundForm.controls.currency.value
                saveInstrumentMutualFund.instrument.ticker = this.instrumentMutualFundForm.controls.ticker.value
                saveInstrumentMutualFund.company = this.instrumentMutualFundForm.controls.company.value
                console.log('saveinstrumentDetail', saveInstrumentMutualFund)
                this.restService.saveInstrumentMutualFund(saveInstrumentMutualFund)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getInstrumentMutualFunds()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.instrumentMutualFundSelectedRow = {} as InstrumentMutualFund
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                console.log('httpErrorResponse', httpErrorResponse)
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            case CrudEnum.UPDATE:
                saveInstrumentMutualFund.instrument.name = this.instrumentMutualFundForm.controls.name.value
                saveInstrumentMutualFund.instrument.currency = this.instrumentMutualFundForm.controls.currency.value
                saveInstrumentMutualFund.instrument.ticker = this.instrumentMutualFundForm.controls.ticker.value
                saveInstrumentMutualFund.company = this.instrumentMutualFundForm.controls.company.value
                saveInstrumentMutualFund.instrument.notes = null

                saveInstrumentMutualFund.id = this.instrumentMutualFundSelectedRow.id;
                saveInstrumentMutualFund.rowVersion = this.instrumentMutualFundSelectedRow.rowVersion;
                saveInstrumentMutualFund.instrument.id = this.instrumentMutualFundSelectedRow.instrument.id;
                saveInstrumentMutualFund.instrument.rowVersion = this.instrumentMutualFundSelectedRow.instrument.rowVersion;

                console.log('saveinstrumentEtf', saveInstrumentMutualFund)
                this.restService.saveInstrumentMutualFund(saveInstrumentMutualFund)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getInstrumentMutualFunds()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.instrumentMutualFundSelectedRow = {} as InstrumentMutualFund
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            case CrudEnum.DELETE:
                console.log('this.instrumentDetailSelectedRow', this.instrumentMutualFundSelectedRow)
                this.restService.deleteInstrumentMutualFund(this.instrumentMutualFundSelectedRow)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getInstrumentMutualFunds()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.instrumentMutualFundSelectedRow = {} as InstrumentMutualFund
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
        this.instrumentMutualFundForm.reset()
        this.modifyAndDeleteButtonsDisable = true
    }

    onCancel() {
        this.resetDialoForm();
        this.displayDialog = false;
        this.sessionService.setDisableParentMessages(false)
        this.modifyAndDeleteButtonsDisable = true
    }
    private resetDialoForm() {
        this.instrumentMutualFundForm.reset()
        this.instrumentMutualFundSelectedRow = {} as InstrumentMutualFund
    }


}
