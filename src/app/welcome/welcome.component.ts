import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
    authenticated: boolean = false;
    logoutMessage: string = '';

    constructor(
        private activatedRoute: ActivatedRoute,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(queryParams => {
            this.logoutMessage = queryParams['logoutMessage']
            console.log('logoutMessage:', this.logoutMessage)
            // In a real app: dispatch action to load the details here.
        });
        this.authService.isAuthenticated$.subscribe(authenticated => {
            this.authenticated = authenticated;
        });
    }
}
