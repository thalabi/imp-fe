import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
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

        this.sessionService.token.subscribe(message => this.token = message);


        let pingResponse: any;
        this.restService.getPing()
            .subscribe((data: any) => this.pingResponse = data);
        //console.log(pingResponse);
    }

}
