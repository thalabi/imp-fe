import { Component, OnInit } from '@angular/core';
import { Portfolio } from './Portfolio';
import { Instrument } from './Instrument';
import { IHoldingDetail } from './IHoldingDetail';
import { CrudEnum } from '../../crud-enum';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RestService } from '../../service/rest.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { SaveHoldingRequest } from './SaveHoldingRequest';
import { SessionService } from '../../service/session.service';
import { BaseComponent } from '../../base/base.component';

@Component({
    selector: 'app-portfolio-holding-management',
    templateUrl: './portfolio-holding-management.component.html',
    styleUrls: ['./portfolio-holding-management.component.css']
})
export class PortfolioHoldingManagementComponent extends BaseComponent implements OnInit {

    portfolioRows: Array<Portfolio> = []
    portfolioCount: number = 0
    selectedPortfolio: Portfolio = {} as Portfolio
    portfolioValue: number = 0
    instrumentRowsByCurrency: Map<string | null, Array<Instrument>> = new Map()
    instrumentArrayForCurrency: Array<Instrument> = []
    loadingStatus: boolean = false;

    holdingDetailList: Array<IHoldingDetail> = []
    holdingDetailListCount: number = 0;

    holdingDetailSelectedRow: IHoldingDetail = {} as IHoldingDetail
    modifyAndDeleteButtonsDisable: boolean = true;
    crudMode: CrudEnum = {} as CrudEnum
    crudEnum = CrudEnum; // Used in html to refer to enum
    displayDialog: boolean = false

    holdingDetailForm: UntypedFormGroup = {} as UntypedFormGroup


    constructor(
        private formBuilder: UntypedFormBuilder,
        private restService: RestService,
        private messageService: MessageService,
        private sessionService: SessionService
    ) {
        super()
    }

    ngOnInit(): void {
        this.getPortfolioTable();
        this.getInstrumentTable();
        this.createForm()
    }

    getPortfolioTable() {
        const tableName: string = 'portfolio'
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        this.restService.getTableData(tableName, 0, 999, ['financialInstitution', 'name'])
            .subscribe(
                {
                    next: (data: any) => {
                        //                        this.portfolioRows = data._embedded[entityNameResource]
                        const portfolioRowsDeletedAndNonDeleted: Array<Portfolio> = data._embedded[entityNameResource]
                        this.portfolioRows = portfolioRowsDeletedAndNonDeleted.filter((portfolioRow) => portfolioRow.logicallyDeleted == false)
                        console.log('this.portfolioRows', this.portfolioRows)
                        //                        this.portfolioCount = data.page.totalElements
                        this.portfolioCount = this.portfolioRows.length
                    },
                    complete: () => {
                        console.log('http request completed')
                        this.loadingStatus = false
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }

    getInstrumentTable() {
        const tableName: string = 'instrument'
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        this.restService.getTableData(tableName, 0, 999, ['name'])
            .subscribe(
                {
                    next: (data: any) => {
                        const allInstrumentRows: Array<Instrument> = data._embedded[entityNameResource]
                        console.log('this.instrumentRows', allInstrumentRows)
                        allInstrumentRows.forEach(instrumentRow => {
                            let instrumentArrayForCurrency: Array<Instrument> = this.instrumentRowsByCurrency.get(instrumentRow.currency) || []
                            instrumentArrayForCurrency.push(instrumentRow)
                            this.instrumentRowsByCurrency.set(instrumentRow.currency, instrumentArrayForCurrency)
                        })
                        console.log('this.instrumentRowsByCurrency', this.instrumentRowsByCurrency)
                    },
                    complete: () => {
                        console.log('http request completed')
                        this.loadingStatus = false
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }

    createForm() {
        this.holdingDetailForm = this.formBuilder.group({
            asOfDate: ['', Validators.required],
            instrument: ['', Validators.required],
            quantity: ['', Validators.required]
        })
    }

    onChangePortfolio(event: any) {
        this.retrieveSelectedPortfolioHoldings()
    }

    private retrieveSelectedPortfolioHoldings() {
        if (! /* not */ this.selectedPortfolio.accountId) {
            this.holdingDetailList = []
            this.holdingDetailListCount = 0
            return
        }
        const portfolioId = this.selectedPortfolio.id
        console.log(portfolioId)
        this.restService.getHoldingDetails(portfolioId)
            .subscribe(
                {
                    next: (data: any) => {
                        console.log('data', data)
                        this.holdingDetailList = data.holdingDetails
                        console.log('this.holdingDetailList', this.holdingDetailList)
                        this.holdingDetailListCount = this.holdingDetailList.length
                    },
                    complete: () => {
                        console.log('http request completed')
                        this.loadingStatus = false
                        this.calculatePortfolioValue()
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });
    }

    private calculatePortfolioValue(): number {
        this.portfolioValue = 0
        this.holdingDetailList.forEach(holdingDetail => {
            this.portfolioValue += holdingDetail.quantity * holdingDetail.latestPrice
        });
        return this.portfolioValue
    }

    onChangeInstrument(event: any) {
        console.log('onChangeInstrument: event', event)
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
        this.instrumentArrayForCurrency = this.instrumentRowsByCurrency.get(this.selectedPortfolio.currency) || []
        switch (this.crudMode) {
            case CrudEnum.ADD:
                this.holdingDetailForm.controls.asOfDate.patchValue(new Date(new Date().setHours(0, 0, 0, 0))); // new date with only date portion
                this.holdingDetailForm.enable();
                break;
            case CrudEnum.UPDATE:
                this.fillInFormWithInstrumentAndQuantity();
                this.holdingDetailForm.enable();
                break;
            case CrudEnum.DELETE:
                this.fillInFormWithInstrumentAndQuantity();
                this.holdingDetailForm.disable();
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
    }

    private fillInFormWithInstrumentAndQuantity(): void {
        this.holdingDetailForm.controls.asOfDate.patchValue(this.holdingDetailSelectedRow.asOfDate);
        this.holdingDetailForm.controls.instrument.patchValue(this.lookupInstrumentById(this.holdingDetailSelectedRow.instrumentId));
        this.holdingDetailForm.controls.quantity.patchValue(this.holdingDetailSelectedRow.quantity);
    }

    private lookupInstrumentById(instrumentId: number): Instrument | undefined {
        return this.instrumentArrayForCurrency.find(instrumentRow => {
            const instrumentRowId = RestService.idFromUrl(instrumentRow._links.self.href)
            return instrumentRowId == this.holdingDetailSelectedRow.instrumentId;
        })
    }
    onInputQuantity(event: any) {
        this.holdingDetailForm.controls.quantity.patchValue(event.value)
        console.log('this.holdingDetailForm.valid', this.holdingDetailForm.valid)
    }
    onSubmit() {
        console.warn('onSubmit()', this.holdingDetailForm.value);
        const saveHoldingRequest: SaveHoldingRequest = {} as SaveHoldingRequest
        switch (this.crudMode) {
            case CrudEnum.ADD:
                saveHoldingRequest.asOfDate = this.holdingDetailForm.controls.asOfDate.value
                saveHoldingRequest.instrumentId = this.holdingDetailForm.controls.instrument.value.id
                saveHoldingRequest.instrumentType = this.holdingDetailForm.controls.instrument.value.type
                saveHoldingRequest.portfolioId = this.selectedPortfolio.id
                saveHoldingRequest.quantity = this.holdingDetailForm.controls.quantity.value
                console.log('saveHoldingRequest', saveHoldingRequest)
                this.restService.saveHolding(saveHoldingRequest)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.retrieveSelectedPortfolioHoldings()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.holdingDetailSelectedRow = {} as IHoldingDetail
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            case CrudEnum.UPDATE:
                saveHoldingRequest.id = this.holdingDetailSelectedRow.id
                saveHoldingRequest.version = this.holdingDetailSelectedRow.version
                saveHoldingRequest.asOfDate = this.holdingDetailForm.controls.asOfDate.value
                saveHoldingRequest.instrumentId = RestService.idFromUrl(this.holdingDetailForm.controls.instrument.value._links.self.href)
                saveHoldingRequest.instrumentType = this.holdingDetailForm.controls.instrument.value.type
                saveHoldingRequest.portfolioId = RestService.idFromUrl(this.selectedPortfolio._links.self.href)
                saveHoldingRequest.quantity = this.holdingDetailForm.controls.quantity.value
                console.log('saveHoldingRequest', saveHoldingRequest)
                this.restService.saveHolding(saveHoldingRequest)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.retrieveSelectedPortfolioHoldings()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.holdingDetailSelectedRow = {} as IHoldingDetail
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            case CrudEnum.DELETE:
                console.log('this.holdingDetailSelectedRow', this.holdingDetailSelectedRow)
                this.restService.deleteHolding(this.holdingDetailSelectedRow.id)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.retrieveSelectedPortfolioHoldings()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.holdingDetailSelectedRow = {} as IHoldingDetail
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
        this.holdingDetailForm.reset()
        this.modifyAndDeleteButtonsDisable = true
    }

    onCancel() {
        this.resetDialoForm();
        this.displayDialog = false;
        this.sessionService.setDisableParentMessages(false)
        this.modifyAndDeleteButtonsDisable = true
    }
    private resetDialoForm() {
        this.holdingDetailForm.reset()
        this.holdingDetailSelectedRow = {} as IHoldingDetail
    }
}
