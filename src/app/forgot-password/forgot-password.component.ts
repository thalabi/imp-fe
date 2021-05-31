import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
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
    serverErrorMessage: string = ''

    constructor(
        private restService: RestService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.baseUrl = location.origin
        console.log('baseUrl', this.baseUrl)
    }

    emailOnKeypress(event: Event): void {
        this.serverErrorMessage = ''
    }
    onSubmit(): void {
        console.log('onSubmit()')
        const email: string = this.form.email;
        console.log('email', email)

        const forgotPasswordRequest: ForgotPasswordRequest = {} as ForgotPasswordRequest;
        forgotPasswordRequest.email = email;
        forgotPasswordRequest.baseUrl = this.baseUrl;
        this.messageService.clear()
        this.serverErrorMessage = ''
        this.restService.forgotPassword(forgotPasswordRequest)
            .subscribe(
                {
                    complete: () => {
                        this.messageService.add({ severity: 'info', summary: '200', detail: 'You request has been submitted.' })
                    },
                    error: (err: HttpErrorResponse) => {
                        console.error(err)
                        if (err.status === 404) { // Could not find a user with this email
                            //this.messageService.add({ severity: 'error', summary: err.status.toString(), detail: err.error })
                            this.serverErrorMessage = err.error
                        } else {
                            this.messageService.add({ severity: 'error', summary: err.status.toString(), detail: 'Server error. Please contact support.' })
                        }
                    }
                });

    }
}
