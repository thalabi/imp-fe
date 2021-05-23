import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestService } from '../service/rest.service';
import { ResetPasswordRequest } from './ResetPasswordRequest';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

    form: any = {
        newPassword: null,
        confirmPassword: null
    }
    isPasswordResetFailed = false
    errorMessage = ''
    resetPasswordJwt: string = ''
    baseUrl: string = ''

    constructor(
        private route: ActivatedRoute,
        private restService: RestService
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.resetPasswordJwt = params['token'];
            console.log('this.resetPasswordJwt', this.resetPasswordJwt)
        });
    }

    onSubmit(): void {
        console.log('onSubmit()')
        const newPassword: string = this.form.newPassword;
        console.log('newPassword', newPassword)
        const confirmPassword: string = this.form.confirmPassword;
        console.log('confirmPassword', confirmPassword)
        this.baseUrl = location.origin
        console.log('baseUrl', this.baseUrl)

        //
        // check if the paswords are equal

        const resetPasswordRequest: ResetPasswordRequest = {} as ResetPasswordRequest
        resetPasswordRequest.resetPasswordJwt = this.resetPasswordJwt
        resetPasswordRequest.newPassword = newPassword
        resetPasswordRequest.baseUrl = this.baseUrl

        this.restService.resetPassword(resetPasswordRequest)
            .subscribe(
                {
                    error: (err: string) => {
                        console.error(err)
                    }
                });

    }
}
