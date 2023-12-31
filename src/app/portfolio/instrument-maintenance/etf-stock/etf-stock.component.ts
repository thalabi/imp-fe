import { Component, Input, OnInit } from '@angular/core';
import { InstrumentMaintenanceComponent } from '../instrument-maintenance.component';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RestService } from '../../../service/rest.service';
import { SessionService } from '../../../service/session.service';
import { InstrumentEtfStock } from './InstrumentEtfStock';
import { CrudEnum } from '../../../crud-enum';
import { Instrument } from '../../portfolio-holding-management/Instrument';

@Component({
    selector: 'app-etf',
    templateUrl: './etf-stock.component.html',
    styleUrls: ['./etf-stock.component.css']
})
export class EtfStockComponent extends InstrumentMaintenanceComponent implements OnInit {

    @Input() instrumentType: string = ''

    loadingStatus: boolean = false;

    instrumentEtfStocks: InstrumentEtfStock[] | null = null;
    instrumentEtfStockCount: number = 0;
    instrumentEtfStockSelectedRow: InstrumentEtfStock = {} as InstrumentEtfStock;

    modifyAndDeleteButtonsDisable: boolean = true;
    crudMode: CrudEnum = {} as CrudEnum
    crudEnum = CrudEnum; // Used in html to refer to enum
    displayDialog: boolean = false

    instrumentEtfStockForm = this.formBuilder.nonNullable.group({
        name: ['', Validators.required],
        currency: ['', Validators.required],
        exchange: ['', Validators.required],
        ticker: ['', Validators.required],
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
        this.getExchanges()

        this.getInstrumentEtfs()
    }
    private getInstrumentEtfs() {
        let tableName: string = ''
        let projectionName: string = ''
        if (this.instrumentType === 'ETF') {
            tableName = 'instrument_etf'
            projectionName = 'instrumentEtfInlineInstrument'
        } else {
            tableName = 'instrument_stock'
            projectionName = 'instrumentStockInlineInstrument'
        }
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        this.restService.getTableData(tableName, 0, 999, [], projectionName)
            .subscribe(
                {
                    next: (data: any) => {
                        this.instrumentEtfStocks = data._embedded[entityNameResource]
                        //this.transformInstrumentBondDateFields()
                        console.log('this.instrumentEtfs', this.instrumentEtfStocks)
                        this.instrumentEtfStockCount = data.page.totalElements
                    },
                    complete: () => {
                        console.log('http request completed')
                        // sort by instrument name
                        // this cannot be done by jpa data rest becuase does not support sort by assosiation columns
                        this.instrumentEtfStocks!.sort((a, b) => (a.instrument.name! < b.instrument.name!) ? -1 : (a.instrument.name! > b.instrument.name!) ? 1 : 0)
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
                this.instrumentEtfStockForm.enable();
                break;
            case CrudEnum.UPDATE:
                this.fillInFormWithValues();
                this.instrumentEtfStockForm.enable();
                //this.setValidators(this.instrumentEtfSelectedRow.type);
                break;
            case CrudEnum.DELETE:
                this.fillInFormWithValues();
                this.instrumentEtfStockForm.disable();
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
    }
    private fillInFormWithValues(): void {
        console.log('this.instrumentEtfSelectedRow', this.instrumentEtfStockSelectedRow)
        this.instrumentEtfStockForm.controls.name.patchValue(this.instrumentEtfStockSelectedRow!.instrument.name);
        // lookup instrument object from instrumentRows (table)
        this.instrumentEtfStockForm.controls.currency.patchValue(this.instrumentEtfStockSelectedRow!.instrument.currency);

        this.instrumentEtfStockForm.controls.exchange.patchValue(this.instrumentEtfStockSelectedRow!.exchange);
        this.instrumentEtfStockForm.controls.ticker.patchValue(this.instrumentEtfStockSelectedRow.instrument.ticker);

        console.log('this.instrumentEtfForm.value', this.instrumentEtfStockForm.value)
    }

    onSubmit() {
        console.warn('onSubmit()', this.instrumentEtfStockForm.value);
        const saveInstrumentEtfStock: InstrumentEtfStock = {} as InstrumentEtfStock
        saveInstrumentEtfStock.instrument = {} as Instrument
        switch (this.crudMode) {
            case CrudEnum.ADD:
                saveInstrumentEtfStock.instrument.name = this.instrumentEtfStockForm.controls.name.value
                saveInstrumentEtfStock.instrument.currency = this.instrumentEtfStockForm.controls.currency.value
                saveInstrumentEtfStock.exchange = this.instrumentEtfStockForm.controls.exchange.value
                saveInstrumentEtfStock.instrument.ticker = this.instrumentEtfStockForm.controls.ticker.value
                console.log('saveinstrumentDetail', saveInstrumentEtfStock)
                this.restService.saveInstrumentDetail(saveInstrumentEtfStock, this.instrumentType)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getInstrumentEtfs()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.instrumentEtfStockSelectedRow = {} as InstrumentEtfStock
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                console.log('httpErrorResponse', httpErrorResponse)
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            case CrudEnum.UPDATE:
                saveInstrumentEtfStock.instrument.name = this.instrumentEtfStockForm.controls.name.value
                saveInstrumentEtfStock.instrument.currency = this.instrumentEtfStockForm.controls.currency.value
                saveInstrumentEtfStock.exchange = this.instrumentEtfStockForm.controls.exchange.value
                saveInstrumentEtfStock.instrument.ticker = this.instrumentEtfStockForm.controls.ticker.value
                saveInstrumentEtfStock.instrument.notes = null

                saveInstrumentEtfStock.id = this.instrumentEtfStockSelectedRow.id;
                saveInstrumentEtfStock.rowVersion = this.instrumentEtfStockSelectedRow.rowVersion;
                saveInstrumentEtfStock.instrument.id = this.instrumentEtfStockSelectedRow.instrument.id;
                saveInstrumentEtfStock.instrument.rowVersion = this.instrumentEtfStockSelectedRow.instrument.rowVersion;

                console.log('saveinstrumentEtf', saveInstrumentEtfStock)
                this.restService.saveInstrumentDetail(saveInstrumentEtfStock, this.instrumentType)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getInstrumentEtfs()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.instrumentEtfStockSelectedRow = {} as InstrumentEtfStock
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            case CrudEnum.DELETE:
                console.log('this.instrumentDetailSelectedRow', this.instrumentEtfStockSelectedRow)
                this.restService.deleteInstrumentDetail(this.instrumentEtfStockSelectedRow, this.instrumentType)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getInstrumentEtfs()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.instrumentEtfStockSelectedRow = {} as InstrumentEtfStock
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
        this.instrumentEtfStockForm.reset()
        this.modifyAndDeleteButtonsDisable = true
    }

    onCancel() {
        this.resetDialoForm();
        this.displayDialog = false;
        this.sessionService.setDisableParentMessages(false)
        this.modifyAndDeleteButtonsDisable = true
    }
    private resetDialoForm() {
        this.instrumentEtfStockForm.reset()
        this.instrumentEtfStockSelectedRow = {} as InstrumentEtfStock
    }

}
