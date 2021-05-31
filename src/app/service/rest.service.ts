import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { ConfigService } from './config.service';
import { UploadResponse } from '../file-transfer-prime-ng/UploadResponse';
import { ForgotPasswordRequest } from '../forgot-password/ForgotPasswordRequest';
import { ResetPasswordRequest } from '../reset-password/ResetPasswordRequest';

@Injectable({
    providedIn: 'root'
})
export class RestService {
    readonly serviceUrl: string;
    //readonly jsonHeader = new HttpHeaders().set("Content-Type", "application/json");
    readonly multipartHeader = new HttpHeaders().set("Content-Type", "multipart/form-data");

    constructor(
        private http: HttpClient,
        private configService: ConfigService,
    ) {
        const applicationProperties = this.configService.getApplicationProperties();
        this.serviceUrl = applicationProperties.serviceUrl;
    }

    getPing() {
        return this.http.get(this.serviceUrl + '/securityController/ping'/*, { headers: this.jsonHeader }*/);
    }

    uploadFile(formData: FormData): Observable<HttpEvent<UploadResponse>> {
        return this.http.post<UploadResponse>(this.serviceUrl + '/fileTransferController/uploadFile', formData, {
            reportProgress: true,
            observe: 'events'
        })
    }
    downloadExceptionsFile(exceptionsFile: string): Observable<HttpEvent<Blob>> {
        return this.http.get(this.serviceUrl + '/fileTransferController/downloadExceptionsFile?exceptionsFile=' + exceptionsFile, {
            responseType: 'blob',
            observe: 'events'

        })
    }


    forgotPassword(forgotPasswordRequest: ForgotPasswordRequest): Observable<void> {
        return this.http.post<void>(this.serviceUrl + '/securityController/forgotPassword', forgotPasswordRequest)
    }

    resetPassword(resetPassword: ResetPasswordRequest): Observable<void> {
        return this.http.post<void>(this.serviceUrl + '/securityController/resetPassword', resetPassword)
    }

}
