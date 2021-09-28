import { Component, OnInit } from '@angular/core';
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

    constructor(
        private restService: RestService,
        private sessionService: SessionService,
    ) { }

    ngOnInit(): void {
    }

    onSubmit(event: any) {
        this.restService.getPriceHoldings()
            .subscribe((data: any) => this.priceHoldingsResponse = data);
    }
}
