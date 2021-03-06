import { HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CrudEnum } from '../crud-enum';
import { RestService } from '../service/rest.service';
import { SaveHoldingRequest } from './SaveHoldingRequest';
import { HoldingDetail } from './HoldingDetail';
import { Instrument } from './Instrument';
import { Portfolio } from './Portfolio';

@Component({
    selector: 'app-portfolio-management',
    templateUrl: './portfolio-management.component.html',
    styleUrls: ['./portfolio-management.component.css']
})
export class PortfolioManagementComponent implements OnInit {

    portfolioRows: Array<Portfolio> = []
    portfolioCount: number = 0
    selectedPortfolio: Portfolio = {} as Portfolio
    portfolioValue: number = 0
    //allInstrumentRows: Array<Instrument> = []
    instrumentRowsByCurrency: Map<string, Array<Instrument>> = new Map()
    instrumentArrayForCurrency: Array<Instrument> = []
    //instrumentCount: number = 0
    selectedInstrument: Instrument = {} as Instrument
    loadingStatus: boolean = false;

    holdingDetailList: Array<HoldingDetail> = []
    holdingDetailListCount: number = 0;

    holdingDetailSelectedRow: HoldingDetail = {} as HoldingDetail
    crudRow: HoldingDetail = {} as HoldingDetail
    modifyAndDeleteButtonsDisable: boolean = true;
    crudMode: CrudEnum = {} as CrudEnum
    crudEnum = CrudEnum; // Used in html to refer to enum
    displayDialog: boolean = false

    holdingDetailForm: FormGroup = {} as FormGroup


    constructor(
        private formBuilder: FormBuilder,
        private restService: RestService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.getPortfolioTable();
        this.getInstrumentTable();
        this.createForm()
    }

    getPortfolioTable() {
        const tableName: string = 'portfolio'
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        this.restService.getTableData(tableName, 0, 999)
            .subscribe(
                {
                    next: (data: any) => {
                        this.portfolioRows = data._embedded[entityNameResource]
                        console.log('this.portfolioRows', this.portfolioRows)
                        this.portfolioCount = data.page.totalElements
                        this.loadingStatus = false

                        //this.portfolioList = this.buildPortfolioList(this.portfolioRows)
                    },
                    complete: () => {
                        // this.messageService.clear()
                        // this.uploadProgressMessage = '';
                        // this.uploadResponse = {} as UploadResponse;
                        // this.messageService.add({ severity: 'info', summary: '200', detail: this.tableFileDownloadProgressMessage })
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                    }
                });
    }

    getInstrumentTable() {
        const tableName: string = 'instrument'
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        this.restService.getTableData(tableName, 0, 999)
            .subscribe(
                {
                    next: (data: any) => {
                        const allInstrumentRows: Array<Instrument> = data._embedded[entityNameResource]
                        console.log('this.instrumentRows', allInstrumentRows)
                        // 
                        allInstrumentRows.forEach(instrumentRow => {
                            let instrumentArrayForCurrency: Array<Instrument> = this.instrumentRowsByCurrency.get(instrumentRow.currency) || []
                            instrumentArrayForCurrency.push(instrumentRow)
                            this.instrumentRowsByCurrency.set(instrumentRow.currency, instrumentArrayForCurrency)
                        })
                        console.log('this.instrumentRowsByCurrency', this.instrumentRowsByCurrency)
                        this.loadingStatus = false

                        //this.portfolioList = this.buildPortfolioList(this.portfolioRows)
                    },
                    complete: () => {
                        // this.messageService.clear()
                        // this.uploadProgressMessage = '';
                        // this.uploadResponse = {} as UploadResponse;
                        // this.messageService.add({ severity: 'info', summary: '200', detail: this.tableFileDownloadProgressMessage })
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
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
        if (! /* not */ this.selectedPortfolio.accountNumber) {
            this.holdingDetailList = []
            this.holdingDetailListCount = 0
            return
        }
        // this.truncateTable = false
        // this.showTable = false
        // this.tableRows = []
        const portfolioId = RestService.idFromUrl(this.selectedPortfolio._links.self.href)
        console.log(portfolioId)
        this.restService.getHoldingDetails(portfolioId)
            .subscribe(
                {
                    next: (data: any) => {
                        console.log('data', data)
                        this.holdingDetailList = data.holdingDetails
                        console.log('this.holdingDetailList', this.holdingDetailList)
                        this.holdingDetailListCount = this.holdingDetailList.length
                        this.loadingStatus = false
                        this.calculatePortfolioValue()
                    },
                    complete: () => {
                        // this.messageService.clear()
                        // this.uploadProgressMessage = '';
                        // this.uploadResponse = {} as UploadResponse;
                        // this.messageService.add({ severity: 'info', summary: '200', detail: this.tableFileDownloadProgressMessage })
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
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
        this.crudRow = Object.assign({}, this.holdingDetailSelectedRow);
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
        this.instrumentArrayForCurrency = this.instrumentRowsByCurrency.get(this.selectedPortfolio.currency) || []
        switch (this.crudMode) {
            case CrudEnum.ADD:
                this.holdingDetailForm.controls.asOfDate.patchValue(new Date(new Date().setHours(0, 0, 0, 0))); // new date with only date portion
                this.enableDisableFormFields(true);
                break;
            case CrudEnum.UPDATE:
                this.fillInFormWithInstrumentAndQuantity();
                this.enableDisableFormFields(true);
                break;
            case CrudEnum.DELETE:
                this.fillInFormWithInstrumentAndQuantity();
                this.enableDisableFormFields(false);
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
        // console.log('this.crudForm', this.crudForm);
    }

    private fillInFormWithInstrumentAndQuantity(): void {
        this.holdingDetailForm.controls.asOfDate.patchValue(this.holdingDetailSelectedRow.asOfDate);

        // lookup instrument object from instrumentRows (table)
        this.holdingDetailForm.controls.instrument.patchValue(this.lookupInstrumentById(this.holdingDetailSelectedRow.instrumentId));

        this.holdingDetailForm.controls.quantity.patchValue(this.holdingDetailSelectedRow.quantity);

    }

    private enableDisableFormFields(enableFields: boolean): void {
        if (enableFields) {
            this.holdingDetailForm.controls.asOfDate.enable();
            this.holdingDetailForm.controls.instrument.enable();
            this.holdingDetailForm.controls.quantity.enable();
        } else {
            this.holdingDetailForm.controls.asOfDate.disable();
            this.holdingDetailForm.controls.instrument.disable();
            this.holdingDetailForm.controls.quantity.disable();
        }
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
                saveHoldingRequest.instrumentId = RestService.idFromUrl(this.holdingDetailForm.controls.instrument.value._links.self.href)
                saveHoldingRequest.portfolioId = RestService.idFromUrl(this.selectedPortfolio._links.self.href)
                saveHoldingRequest.quantity = this.holdingDetailForm.controls.quantity.value
                console.log('saveHoldingRequest', saveHoldingRequest)
                this.restService.addHolding(saveHoldingRequest)
                    .subscribe(
                        {
                            next: (saveHoldingResponse: any) => {
                                console.log('saveHoldingResponse', saveHoldingResponse)
                                if (saveHoldingResponse.saveHoldingStatusMessage) {
                                    this.messageService.add({ severity: 'error', summary: saveHoldingResponse.saveHoldingStatusMessage })
                                } else {
                                    this.retrieveSelectedPortfolioHoldings()
                                    this.displayDialog = false;
                                    this.holdingDetailSelectedRow = {} as HoldingDetail
                                }
                            },
                            complete: () => {
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
            case CrudEnum.UPDATE:
                saveHoldingRequest.id = this.holdingDetailSelectedRow.id
                saveHoldingRequest.version = this.holdingDetailSelectedRow.version
                saveHoldingRequest.asOfDate = this.holdingDetailForm.controls.asOfDate.value
                saveHoldingRequest.instrumentId = RestService.idFromUrl(this.holdingDetailForm.controls.instrument.value._links.self.href)
                saveHoldingRequest.portfolioId = RestService.idFromUrl(this.selectedPortfolio._links.self.href)
                saveHoldingRequest.quantity = this.holdingDetailForm.controls.quantity.value
                console.log('saveHoldingRequest', saveHoldingRequest)
                this.restService.updateHolding(saveHoldingRequest)
                    .subscribe(
                        {
                            next: (saveHoldingResponse: any) => {
                                console.log('saveHoldingResponse', saveHoldingResponse)
                                if (saveHoldingResponse.saveHoldingStatusMessage) {
                                    this.messageService.add({ severity: 'error', summary: saveHoldingResponse.saveHoldingStatusMessage })
                                } else {
                                    this.retrieveSelectedPortfolioHoldings()
                                    this.displayDialog = false;
                                    this.holdingDetailSelectedRow = {} as HoldingDetail
                                }
                            },
                            complete: () => {
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
                console.log('this.holdingDetailSelectedRow', this.holdingDetailSelectedRow)
                this.restService.deleteHolding(this.holdingDetailSelectedRow.id)
                    .subscribe(
                        {
                            next: (httpResponse: HttpResponse<void>) => {
                                console.log('httpResponse', httpResponse)

                                this.retrieveSelectedPortfolioHoldings()
                                this.displayDialog = false;
                                this.holdingDetailSelectedRow = {} as HoldingDetail
                            },
                            complete: () => {
                                // this.messageService.clear()
                                // this.uploadProgressMessage = '';
                                // this.uploadResponse = {} as UploadResponse;
                                // this.messageService.add({ severity: 'info', summary: '200', detail: this.tableFileDownloadProgressMessage })
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
        this.holdingDetailForm.reset()
    }

    onCancel() {
        this.resetDialoForm();
        this.displayDialog = false;
        this.modifyAndDeleteButtonsDisable = true
    }
    private resetDialoForm() {
        this.holdingDetailForm.reset()
        this.holdingDetailSelectedRow = {} as HoldingDetail
    }

    private buildPortfolioList(portfolioRows: Array<Portfolio>): Array<string> {
        let portfolioList: Array<string> = []
        console.log('portfolioRows', portfolioRows)
        portfolioRows.forEach(portfolio => portfolioList.push(portfolio.institution + '-' + portfolio.accountNumber))
        console.log('portfolioList', portfolioList)
        return portfolioList
    }
}