import { Component, OnInit } from '@angular/core';
import { RestService } from '../service/rest.service';
import { PingResponse } from './PingResponse';
import { AuthService, UserInfo } from '../auth/auth.service';

@Component({
    selector: 'app-ping',
    templateUrl: './ping.component.html',
    styleUrls: ['./ping.component.css']
})
export class PingComponent implements OnInit {
    name: any;
    pingResponse: PingResponse = {} as PingResponse;
    token: string = '';
    userInfo: UserInfo = {} as UserInfo;

    constructor(
        private restService: RestService, private authService: AuthService
    ) { }

    ngOnInit(): void {

        console.log('======================================');

        this.restService.getPing()
            .subscribe((data: any) => this.pingResponse = data);

        this.authService.getUserInfo()
            .subscribe((userInfo: UserInfo) => {
                this.userInfo = userInfo;
                console.log('userInfo', this.userInfo);
            })

    }

}
