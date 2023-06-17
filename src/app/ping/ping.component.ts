import { Component, OnInit } from '@angular/core';

import { CustomUserDetails } from '../login/CustomUserDetails';
import { RestService } from '../service/rest.service';
import { PingResponse } from './PingResponse';

@Component({
    selector: 'app-ping',
    templateUrl: './ping.component.html',
    styleUrls: ['./ping.component.css']
})
export class PingComponent implements OnInit {
    name: any;
    pingResponse: PingResponse = {} as PingResponse;
    token: string = '';
    customUserDetails: CustomUserDetails = {} as CustomUserDetails;

    constructor(
        private restService: RestService
    ) { }

    ngOnInit(): void {

        console.log('======================================');
        this.restService.getPing()
            .subscribe((data: any) => this.pingResponse = data);
    }

}
