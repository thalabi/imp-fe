import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
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
    passworValidationMessage: string = ''

    constructor(
        private route: ActivatedRoute,
        private restService: RestService,
        private messageService: MessageService
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
        const url = location.href
        console.log('url', url)
        this.baseUrl = url.substring(0, url.lastIndexOf('/'))
        console.log('baseUrl', this.baseUrl)

        this.passworValidationMessage = ''
        if (newPassword !== confirmPassword) {
            this.passworValidationMessage = 'Passwords dont match.'
            return
        }

        const resetPasswordRequest: ResetPasswordRequest = {} as ResetPasswordRequest
        resetPasswordRequest.resetPasswordJwt = this.resetPasswordJwt
        resetPasswordRequest.newPassword = newPassword
        resetPasswordRequest.baseUrl = this.baseUrl

        this.restService.resetPassword(resetPasswordRequest)
            .subscribe(
                {
                    complete: () => {
                        this.messageService.add({ severity: 'info', summary: '200', detail: 'Your password has been reset. Please click the link below to login.' })
                    },
                    error: (err: HttpErrorResponse) => {
                        console.error(err)
                        if (err.status === 400) { // Could not find a user with this email
                            this.messageService.add({ severity: 'error', summary: err.status.toString(), detail: err.error })
                        } else {
                            this.messageService.add({ severity: 'error', summary: err.status.toString(), detail: 'Server error. Please contact support.' })
                        }
                    }
                });

    }
}
