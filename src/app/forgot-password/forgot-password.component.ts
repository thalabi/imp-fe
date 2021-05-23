import { Component, OnInit } from '@angular/core';
import { ForgotPasswordRequest } from '../forgot-password/ForgotPasswordRequest';
import { RestService } from '../service/rest.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

    form: any = {
        email: null
    };
    baseUrl: string = ''

    constructor(
        private restService: RestService
    ) { }

    ngOnInit(): void {
        this.baseUrl = location.origin
        console.log('baseUrl', this.baseUrl)
    }

    onSubmit(): void {
        console.log('onSubmit()')
        const email: string = this.form.email;
        console.log('email', email)

        const forgotPasswordRequest: ForgotPasswordRequest = {} as ForgotPasswordRequest;
        forgotPasswordRequest.email = email;
        forgotPasswordRequest.baseUrl = this.baseUrl;
        this.restService.forgotPassword(forgotPasswordRequest)
            .subscribe(
                {
                    error: (err: string) => {
                        console.error(err)
                    }
                });

    }
}
