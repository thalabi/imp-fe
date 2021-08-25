import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CrudEnum } from '../crud-enum';
import { RestService } from '../service/rest.service';
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
    instrumentRows: Array<Instrument> = []
    instrumentCount: number = 0
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
                        this.instrumentRows = data._embedded[entityNameResource]
                        console.log('this.instrumentRows', this.instrumentRows)
                        this.instrumentCount = data.page.totalElements
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
            instrument: ['', Validators.required],
            quantity: ['', Validators.required]
        })
    }

    onChangePortfolio(event: any) {
        if (! /* not */ this.selectedPortfolio) {
            this.holdingDetailList = []
            this.holdingDetailListCount = 0
            return
        }
        // this.truncateTable = false
        // this.showTable = false
        // this.tableRows = []
        const url: string = this.selectedPortfolio._links.self.href.toString();
        const portfolioId = +url.substring(url.lastIndexOf('/') + 1)
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
        switch (this.crudMode) {
            case CrudEnum.ADD:
                // this.fieldAttributesArray.forEach(fieldAttributes => {
                //     let control: AbstractControl = this.crudForm.controls[fieldAttributes.columnName];
                //     console.log('fieldAttributes.dataType', fieldAttributes.dataType);
                //     ComponentHelper.initControlValues(control, fieldAttributes.dataType);
                //     control.enable();
                // });
                // this.selectedAssociationArray = [];
                // this.populateAvailableAssociationArray();
                break;
            case CrudEnum.UPDATE:
                let instrumentControl: AbstractControl = this.holdingDetailForm.controls['instrument'];
                // lookup instrument object from instrumentRows (table)
                instrumentControl.patchValue(this.instrumentRows.find(instrumentRow => {
                    const url: string = instrumentRow._links.self.href.toString();
                    const instrumentRowId = +url.substring(url.lastIndexOf('/') + 1);
                    return instrumentRowId == this.holdingDetailSelectedRow.instrumentId;
                }));
                instrumentControl.enable();

                let quantityControl: AbstractControl = this.holdingDetailForm.controls['quantity'];
                quantityControl.patchValue(this.holdingDetailSelectedRow.quantity);
                quantityControl.enable();
                break;
            case CrudEnum.DELETE:
                // this.fieldAttributesArray.forEach(fieldAttributes => {
                //     let control: AbstractControl = this.crudForm.controls[fieldAttributes.columnName];
                //     control.patchValue(this.crudRow[fieldAttributes.columnName]);
                //     control.disable();
                // });
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
        // console.log('this.crudForm', this.crudForm);
    }

    onSubmit() {
        console.warn(this.holdingDetailForm.value);

    }
    onCancel() {

    }
    private buildPortfolioList(portfolioRows: Array<Portfolio>): Array<string> {
        let portfolioList: Array<string> = []
        console.log('portfolioRows', portfolioRows)
        portfolioRows.forEach(portfolio => portfolioList.push(portfolio.institution + '-' + portfolio.accountNumber))
        console.log('portfolioList', portfolioList)
        return portfolioList
    }
}