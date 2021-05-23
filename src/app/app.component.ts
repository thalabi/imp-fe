import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CustomUserDetails } from './login/CustomUserDetails';
import { SessionService } from './service/session.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    // title = 'springsecurityjwt'
    // items: any;//MenuItem[] = {} as MenuItem[]
    // //customUserDetails: CustomUserDetails = {} as CustomUserDetails;

    constructor(
        private sessionService: SessionService,
    ) { }

    ngOnInit() {
        // console.log('ngOnInit()')
        // this.sessionService.customUserDetails.subscribe(message => {
        //     let customUserDetails: CustomUserDetails = message;
        //     if (customUserDetails.id) {
        //         this.items = [
        //             {
        //                 label: 'Ping', routerLink: ['/ping']
        //             },
        //             {
        //                 label: 'File Transfer',
        //                 items: [
        //                     { label: 'Plain', routerLink: ['/fileTransfer'] },
        //                     { label: 'PrimeNG', routerLink: ['/fileTransferPrimeNg'] },

        //                 ]
        //             },
        //             {
        //                 label: 'Logout', routerLink: ['/login']
        //             },
        //         ];
        //     }
        // });
    }
}
