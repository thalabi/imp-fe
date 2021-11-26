import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { RestService } from '../service/rest.service';
import { SessionService } from '../service/session.service';
import { PriceHoldingsResponse } from './PriceHoldingsResponse';

@Component({
    selector: 'app-price-holdings',
    templateUrl: './price-holdings.component.html',
    styleUrls: ['./price-holdings.component.css']
})
export class PriceHoldingsComponent implements OnInit {

    priceHoldingsResponse: PriceHoldingsResponse = {} as PriceHoldingsResponse;
    processingMessage: string = ''
    sendEmail: boolean = false;

    constructor(
        private restService: RestService,
        private messageService: MessageService

    ) { }

    ngOnInit(): void {
    }

    onSubmit(event: any) {
        this.processingMessage = 'Pricing holdings:'
        this.restService.getPriceHoldings(this.sendEmail)
            .subscribe((data: any) => {
                this.processingMessage = ''
                this.priceHoldingsResponse = data
                if (this.priceHoldingsResponse.message) {
                    this.messageService.add({ severity: 'error', summary: 'Server error. Please contact support.', detail: this.priceHoldingsResponse.message })
                } else {
                    this.messageService.add({ severity: 'info', summary: '200', detail: `Pricing holdings completed at ${this.priceHoldingsResponse.timestamp}` })
                }
            });
    }
}
