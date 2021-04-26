import { Component, OnInit } from '@angular/core';
import { RestService } from '../service/rest.service';
import { SessionService } from '../service/session.service';
import { CustomUserDetails } from './CustomUserDetails';
import { Router } from '@angular/router';

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
    isLoggedIn = false;
    isLoginFailed = false;
    errorMessage = '';
    roles: string[] = [];

    loginResponse: { customUserDetails: CustomUserDetails; token: string; } = { customUserDetails: {} as CustomUserDetails, token: '' };

    constructor(
        private restService: RestService,
        private sessionService: SessionService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.sessionService.setToken('');
    }

    onSubmit(): void {
        const { username, email, password } = this.form;
        console.log('form:', this.form);

        this.restService.authenticate(username, password)
            .subscribe((data: any) => {
                this.loginResponse = data;
                console.log(data);
                this.sessionService.setToken(this.loginResponse.token);
                this.router.navigate(['/ping']);
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
