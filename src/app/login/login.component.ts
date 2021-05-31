import { Component, OnInit } from '@angular/core';
import { RestService } from '../service/rest.service';
import { SessionService } from '../service/session.service';
import { CustomUserDetails } from './CustomUserDetails';
import { Router } from '@angular/router';
import { LoginRequest } from '../security/LoginRequest';
import { LoginResponse } from '../security/LoginResponse';
import { AuthenticationService } from '../security/authentication.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    form: any = {
        username: null,
        password: null
    };
    isLoginFailed = false;
    errorMessage = '';
    roles: string[] = [];

    loginResponse: LoginResponse = {} as LoginResponse;//{ customUserDetails: CustomUserDetails; token: string; } = { customUserDetails: {} as CustomUserDetails, token: '' };

    constructor(
        //private restService: RestService,
        private authenticationService: AuthenticationService,
        private sessionService: SessionService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        console.log('ngOnInit()')
        this.sessionService.setToken('');
        this.sessionService.setCustomUserDetails({} as CustomUserDetails);
    }

    onSubmit(): void {
        const loginRequest: LoginRequest = this.form;
        console.log('form:', this.form);

        this.authenticationService.authenticate(loginRequest)
            .subscribe(
                {
                    next: (data: LoginResponse) => {
                        this.loginResponse = data;
                        console.log(data);
                        this.sessionService.setToken(this.loginResponse.token);
                        this.sessionService.setCustomUserDetails(this.loginResponse.customUserDetails);
                        this.sessionService.setIsAuthenticated(true);
                        this.router.navigate(['/ping']);
                    },
                    error: (err: string) => {
                        console.error(err)
                        this.isLoginFailed = true;
                        this.errorMessage = err;
                    }
                });
        // this.authService.register(username, email, password).subscribe(
        //   data => {
        //     console.log(data);
        //     this.isSuccessful = true;
        //     this.isSignUpFailed = false;
        //   },
        //   err => {
        //     this.errorMessage = err.error.message;
        //     this.isSignUpFailed = true;
        //   }
        // );
    }
}
