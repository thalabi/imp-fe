import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
    items: any //Array<MenuItem> = {} as Array<MenuItem>
    //customUserDetails: CustomUserDetails = {} as CustomUserDetails;

    constructor(
        private authService: AuthService//, private sessionService: SessionService,
    ) { }

    ngOnInit(): void {
        console.log('ngOnInit()')
        // this.sessionService.customUserDetailsObservable.subscribe(message => {
        //     let customUserDetails: CustomUserDetails = message;
        //     if (customUserDetails?.id) {
        //         console.log('this.customUserDetails?.id is true')
        this.authService.isAuthenticated$.subscribe(authenticated => {
            if (authenticated) {
                this.items = [
                    {
                        label: 'Ping', routerLink: ['/ping']
                    },
                    {
                        label: 'File Transfer',
                        items: [
                            { label: 'Plain', routerLink: ['/fileTransfer'] },
                            { label: 'PrimeNG', routerLink: ['/fileTransferPrimeNg'] },

                        ]
                    },
                    {
                        label: 'Portfolio',
                        items: [
                            { label: 'Price Holdings', routerLink: ['/priceHoldings'] },
                            { label: 'Portfolio Management', routerLink: ['/portfolioManagement'] },
                            { label: 'Purge Position Snapshot', routerLink: ['/purgePositionSnapshot'] }
                        ]
                    },
                    {
                        //label: 'Logout', icon: 'pi pi-user', routerLink: ['']
                        icon: 'pi pi-user',
                        items: [
                            { label: 'Password', routerLink: [''] },
                            { label: 'Logout', command: () => this.logout() },

                        ]
                    },
                ]
            } else {
                this.items = [
                    { label: 'Login', command: () => this.login() }
                ];
            }
        })
    }

    login() {
        this.authService.login()
    }

    logout() {
        this.authService.logout();
    }

}
