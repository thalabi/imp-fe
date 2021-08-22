import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { RestService } from '../service/rest.service';
import { HoldingDetail } from './HoldingDetail';
import { Portfolio } from './Portfolio';

@Component({
    selector: 'app-portfolio-management',
    templateUrl: './portfolio-management.component.html',
    styleUrls: ['./portfolio-management.component.css']
})
export class PortfolioManagementComponent implements OnInit {

    portfolioRows: Array<Portfolio> = []
    portfolioCount: number = 0
    loadingStatus: boolean = false;

    selectedPortfolio: Portfolio = {} as Portfolio
    holdingDetailList: Array<HoldingDetail> = []
    holdingDetailListCount: number = 0;

    constructor(
        private restService: RestService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
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

    private buildPortfolioList(portfolioRows: Array<Portfolio>): Array<string> {
        let portfolioList: Array<string> = []
        console.log('portfolioRows', portfolioRows)
        portfolioRows.forEach(portfolio => portfolioList.push(portfolio.institution + '-' + portfolio.accountNumber))
        console.log('portfolioList', portfolioList)
        return portfolioList
    }
}