import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
    items: Array<MenuItem> = {} as Array<MenuItem>

    constructor(
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        console.log('ngOnInit()')
        this.authService.isAuthenticated$.subscribe(authenticated => {
            if (authenticated) {
                this.items = [
                    {
                        label: 'Ping', routerLink: ['/ping']
                    },
                    {
                        label: 'File Transfer', routerLink: ['/fileTransferPrimeNg']
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
                            { label: 'Password', url: environment.keycloak.issuer + '/account/#/security/signingin' },
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
