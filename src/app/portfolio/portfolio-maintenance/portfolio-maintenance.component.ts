import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RestService } from '../../service/rest.service';
import { IPortfolioWithDependentFlags } from './IPortfolioWithDependentFlags';
import { CrudEnum } from '../../crud-enum';
import { SessionService } from '../../service/session.service';
import { Portfolio } from '../portfolio-holding-management/Portfolio';
import { BaseComponent } from '../../base/base.component';
import { HolderAndName } from './HolderAndName';

export enum LogicallyDeletedOptionEnum {
    AVAILABLE = 'Available', LOGICALLY_DELETED = 'Logically deleted', ALL = 'All'
}

@Component({
    selector: 'app-portfolio-maintenance',
    templateUrl: './portfolio-maintenance.component.html',
    styleUrls: ['./portfolio-maintenance.component.css']
})

export class PortfolioMaintenanceComponent extends BaseComponent implements OnInit {
    currencies: Array<string> = []
    financialInstitutions: Array<string> = []
    holderOptions: Array<{ value: string, name: string }> = []

    logicallyDeletedOptions: LogicallyDeletedOptionEnum[] = [LogicallyDeletedOptionEnum.AVAILABLE, LogicallyDeletedOptionEnum.LOGICALLY_DELETED, LogicallyDeletedOptionEnum.ALL]
    logicallyDeletedOption: LogicallyDeletedOptionEnum = LogicallyDeletedOptionEnum.AVAILABLE
    logicallyDeletedOptionEnum = LogicallyDeletedOptionEnum; // Used in html to refer to enum

    allPortfolios: Array<IPortfolioWithDependentFlags> = []
    availablePortfolios: Array<IPortfolioWithDependentFlags> = []
    logicallyDeletedPortfolios: Array<IPortfolioWithDependentFlags> = []

    displayPortfolios: Array<IPortfolioWithDependentFlags> = []

    displayPortfoliosCount: number = 0
    loadingStatus: boolean = false


    portfolio: Portfolio[] | null = null;
    portfolioSelectedRow: Portfolio = {} as Portfolio;
    modifyAndDeleteButtonsDisable: boolean = true;
    crudMode: CrudEnum = {} as CrudEnum
    crudEnum = CrudEnum; // Used in html to refer to enum
    displayDialog: boolean = false

    portfolioForm = this.formBuilder.nonNullable.group({
        name: ['', Validators.required],
        holder: ['', Validators.required],
        financialInstitution: ['', Validators.required],
        currency: ['', Validators.required],
        accountNumber: ['', Validators.required],
        logicallyDeleted: [false, Validators.required]
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
        this.getHolders()
        this.getPortfoliosWithDependentFlags()
    }

    private getPortfoliosWithDependentFlags() {

        this.restService.getPortfoliosWithDependentFlags()
            .subscribe(
                {
                    next: (data: Array<IPortfolioWithDependentFlags>) => {
                        this.allPortfolios = data
                        console.log('this.allPortfolios', this.allPortfolios)
                    },
                    complete: () => {
                        console.log('http request completed')
                        this.populateAvailableAndLogicallyDeleted()
                        this.setDisplayPortfolios()
                        this.loadingStatus = false
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
        this.modifyAndDeleteButtonsDisable = false;
    }
    onRowUnselect(event: any) {
        console.log(event);
        this.modifyAndDeleteButtonsDisable = true;
    }

    onChangeLogicallyDeleted(event: any) {
        console.log('onChangeLogicallyDeleted')
        this.setDisplayPortfolios()
    }
    onChangeHolder(event: any) {
        console.log('onChangeHolder: event', event)
    }

    showDialog(crudMode: CrudEnum) {
        this.displayDialog = true;
        this.sessionService.setDisableParentMessages(true)
        this.crudMode = crudMode;
        console.log('this.crudMode', this.crudMode);
        switch (this.crudMode) {
            case CrudEnum.ADD:
                this.portfolioForm.enable();
                break;
            case CrudEnum.UPDATE:
                this.fillInFormWithValues();
                this.portfolioForm.enable();
                break;
            case CrudEnum.DELETE:
                this.fillInFormWithValues();
                this.portfolioForm.disable();
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
    }


    private fillInFormWithValues(): void {
        console.log('this.instrumentInterestBearingSelectedRow', this.portfolioSelectedRow)
        this.portfolioForm.controls.name.patchValue(this.portfolioSelectedRow.name);
        this.portfolioForm.controls.holder.patchValue(this.portfolioSelectedRow.holder);
        this.portfolioForm.controls.accountNumber.patchValue(this.portfolioSelectedRow.accountNumber);
        this.portfolioForm.controls.financialInstitution.patchValue(this.portfolioSelectedRow.financialInstitution);
        this.portfolioForm.controls.currency.patchValue(this.portfolioSelectedRow.currency);
        this.portfolioForm.controls.logicallyDeleted.patchValue(this.portfolioSelectedRow.logicallyDeleted);
        console.log('this.portfolioForm.value', this.portfolioForm.value)
    }

    onSubmit() {
        console.warn('onSubmit()', this.portfolioForm.value);
        const savePortfolio: Portfolio = {} as Portfolio
        switch (this.crudMode) {
            case CrudEnum.ADD:
                savePortfolio.name = this.portfolioForm.controls.name.value
                savePortfolio.holder = this.portfolioForm.controls.holder.value
                savePortfolio.accountNumber = this.portfolioForm.controls.accountNumber.value
                savePortfolio.financialInstitution = this.portfolioForm.controls.financialInstitution.value
                savePortfolio.currency = this.portfolioForm.controls.currency.value
                savePortfolio.logicallyDeleted = this.portfolioForm.controls.logicallyDeleted.value
                console.log('savePortfolio', savePortfolio)
                this.restService.savePortfolio(savePortfolio)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getPortfoliosWithDependentFlags()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.portfolioSelectedRow = {} as Portfolio
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            case CrudEnum.UPDATE:
                savePortfolio.id = this.portfolioSelectedRow.id
                savePortfolio.version = this.portfolioSelectedRow.version
                savePortfolio.name = this.portfolioForm.controls.name.value
                savePortfolio.holder = this.portfolioForm.controls.holder.value
                savePortfolio.accountNumber = this.portfolioForm.controls.accountNumber.value
                savePortfolio.financialInstitution = this.portfolioForm.controls.financialInstitution.value
                savePortfolio.currency = this.portfolioForm.controls.currency.value
                savePortfolio.logicallyDeleted = this.portfolioForm.controls.logicallyDeleted.value
                console.log('savePortfolio', savePortfolio)
                this.restService.savePortfolio(savePortfolio)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getPortfoliosWithDependentFlags()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.portfolioSelectedRow = {} as Portfolio
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
                break;
            case CrudEnum.DELETE:
                console.log('this.portfolioSelectedRow', this.portfolioSelectedRow)
                this.restService.deletePortfolio(this.portfolioSelectedRow.id)
                    .subscribe(
                        {
                            next: (response: any) => {
                                console.log('response', response)
                            },
                            complete: () => {
                                console.log('http request completed')
                                this.getPortfoliosWithDependentFlags()
                                this.displayDialog = false;
                                this.sessionService.setDisableParentMessages(false)
                                this.portfolioSelectedRow = {} as Portfolio
                            },
                            error: (httpErrorResponse: HttpErrorResponse) => {
                                this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                            }
                        });
                break;
            default:
                console.error('this.crudMode is invalid. this.crudMode: ' + this.crudMode);
        }
        this.portfolioForm.reset()
    }

    onCancel() {
        this.resetDialoForm();
        this.displayDialog = false;
        this.sessionService.setDisableParentMessages(false)
        this.modifyAndDeleteButtonsDisable = true
    }
    private resetDialoForm() {
        this.portfolioForm.reset()
        this.portfolioSelectedRow = {} as Portfolio
    }

    onChangeFinancialInstitution(event: any) {
        console.log('onChangeFinancialInstitution: event', event)
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

}
