import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, UserInfo } from '../auth/auth.service';
import { SessionService } from '../service/session.service';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
    authenticated: boolean = false;
    logoutMessage: string = '';
    userInfo: UserInfo = {} as UserInfo;

    constructor(
        private activatedRoute: ActivatedRoute,
        private authService: AuthService,
        private sessionService: SessionService
    ) { }

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(queryParams => {
            this.logoutMessage = queryParams['logoutMessage']
            console.log('logoutMessage:', this.logoutMessage)
            // In a real app: dispatch action to load the details here.
        })
        this.authService.isAuthenticated$.subscribe(authenticated => {
            this.authenticated = authenticated;
            if (this.authenticated) {
                this.sessionService.userInfoObservable.subscribe(userInfo => {
                    // Only if the userInfo object is not set ie empty object, call the getUserInfo (rest api)
                    if (Object.keys(userInfo).length === 0) {
                        this.authService.getUserInfo().subscribe((userInfo: UserInfo) => {
                            console.log('userInfo', userInfo);
                            this.userInfo = userInfo
                            this.sessionService.setUserInfo(userInfo)
                        })
                    }
                })
            }
        })
    }
}
