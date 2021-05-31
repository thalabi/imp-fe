import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CustomUserDetails } from '../login/CustomUserDetails';
import { RestService } from '../service/rest.service';
import { SessionService } from '../service/session.service';
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
        // private route: ActivatedRoute,
        private restService: RestService,
        private sessionService: SessionService,
    ) { }

    ngOnInit(): void {
        // this.route.queryParams.subscribe(params => {
        //     this.name = params['name'];
        // });

        console.log('======================================');

        this.sessionService.tokenObservable.subscribe(message => this.token = message);
        this.sessionService.customUserDetailsObservable.subscribe(message => this.customUserDetails = message);


        let pingResponse: any;
        this.restService.getPing()
            .subscribe((data: any) => this.pingResponse = data);
        //console.log(pingResponse);
    }

}
