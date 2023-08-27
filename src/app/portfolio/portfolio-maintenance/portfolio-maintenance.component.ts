import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RestService } from '../../service/rest.service';
import { IPortfolioWithDependentFlags } from './IPortfolioWithDependentFlags';
import { CrudEnum } from '../../crud-enum';

export enum LogicallyDeletedOptionEnum {
    AVAILABLE = 'Available', LOGICALLY_DELETED = 'Logically deleted', ALL = 'All'
}

@Component({
    selector: 'app-portfolio-maintenance',
    templateUrl: './portfolio-maintenance.component.html',
    styleUrls: ['./portfolio-maintenance.component.css']
})

export class PortfolioMaintenanceComponent implements OnInit {

    logicallyDeletedOptions: LogicallyDeletedOptionEnum[] = [LogicallyDeletedOptionEnum.AVAILABLE, LogicallyDeletedOptionEnum.LOGICALLY_DELETED, LogicallyDeletedOptionEnum.ALL]
    logicallyDeletedOption: LogicallyDeletedOptionEnum = LogicallyDeletedOptionEnum.AVAILABLE
    logicallyDeletedOptionEnum = LogicallyDeletedOptionEnum; // Used in html to refer to enum

    allPortfolios: Array<IPortfolioWithDependentFlags> = []
    availablePortfolios: Array<IPortfolioWithDependentFlags> = []
    logicallyDeletedPortfolios: Array<IPortfolioWithDependentFlags> = []

    displayPortfolios: Array<IPortfolioWithDependentFlags> = []

    displayPortfoliosCount: number = 0
    loadingStatus: boolean = false

    portfolioSelectedRow: IPortfolioWithDependentFlags = {} as IPortfolioWithDependentFlags
    crudRow: IPortfolioWithDependentFlags = {} as IPortfolioWithDependentFlags
    modifyAndDeleteButtonsDisable: boolean = true;
    crudMode: CrudEnum = {} as CrudEnum
    crudEnum = CrudEnum; // Used in html to refer to enum
    displayDialog: boolean = false

    constructor(
        private restService: RestService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,

    ) { }

    ngOnInit(): void {
        this.getPortfoliosWithDependentFlags()
    }

    private getPortfoliosWithDependentFlags() {

        this.restService.getPortfoliosWithDependentFlags()
            .subscribe(
                {
                    next: (data: Array<IPortfolioWithDependentFlags>) => {
                        this.allPortfolios = data
                        console.log('this.allPortfolios', this.allPortfolios)

                        this.populateAvailableAndLogicallyDeleted()
                        this.setDisplayPortfolios()
                        this.loadingStatus = false

                        //this.portfolioList = this.buildPortfolioList(this.portfolioRows)
                    },
                    complete: () => {
                        console.log('http request completed')
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                    }
                });
    }
    private populateAvailableAndLogicallyDeleted() {
        this.availablePortfolios = this.allPortfolios.filter(portfolio => !portfolio.logicallyDeleted)
        this.logicallyDeletedPortfolios = this.allPortfolios.filter(portfolio => portfolio.logicallyDeleted)
    }
    private setDisplayPortfolios() {
        switch (this.logicallyDeletedOption) {
            case LogicallyDeletedOptionEnum.AVAILABLE:
                this.displayPortfolios = this.availablePortfolios
                break;
            case LogicallyDeletedOptionEnum.LOGICALLY_DELETED:
                this.displayPortfolios = this.logicallyDeletedPortfolios
                break;
            case LogicallyDeletedOptionEnum.ALL:
                this.displayPortfolios = this.allPortfolios
                break;
            default:
                console.error('this.logicallyDeletedOption is invalid. this.logicallyDeletedOption: ' + this.logicallyDeletedOption);
        }
        this.displayPortfoliosCount = this.displayPortfolios.length
    }
    onRowSelect(event: any) {
        console.log(event);
        console.log('onRowSelect()')
        this.crudRow = Object.assign({}, this.portfolioSelectedRow);
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

    onChangeLogicallyDeleted(event: any) {
        console.log('onChangeLogicallyDeleted')
        this.setDisplayPortfolios()
    }

    showDialog(crudMode: CrudEnum) {
        this.displayDialog = true;
        this.crudMode = crudMode;
        console.log('this.crudMode', this.crudMode);
        switch (this.crudMode) {
            case CrudEnum.ADD:
                // this.instrumentInterestBearingForm.controls.emailNotification.patchValue(true);
                // this.instrumentInterestBearingForm.enable();
                break;
            case CrudEnum.UPDATE:
                // this.fillInFormWithValues();
                // this.instrumentInterestBearingForm.enable();
                break;
            case CrudEnum.DELETE:
                // this.fillInFormWithValues();
                // this.instrumentInterestBearingForm.disable();
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
    }


}
