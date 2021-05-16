import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse, HttpEvent } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { SessionService } from './session.service';
import { CustomUserDetails } from '../login/CustomUserDetails';
import { LoginResponse } from '../login/LoginResponse';
import { LoginRequest } from '../login/LoginRequest';
import { ConfigService } from './config.service';
import { UploadResponse } from './UploadResponse';

@Injectable({
    providedIn: 'root'
})
export class RestService {
    readonly serviceUrl: string;
    readonly jsonHeader = new HttpHeaders().set("Content-Type", "application/json");
    readonly multipartHeader = new HttpHeaders().set("Content-Type", "multipart/form-data");

    constructor(
        private http: HttpClient,
        private configService: ConfigService,
    ) {
        const applicationProperties = this.configService.getApplicationProperties();
        this.serviceUrl = applicationProperties.serviceUrl;
    }

    getPing() {
        return this.http.get(this.serviceUrl + '/jwtController/ping', { headers: this.jsonHeader });
    }

    authenticate(loginRequest: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(this.serviceUrl + '/jwtController/authenticate', loginRequest, { headers: this.jsonHeader })
            .pipe(
                catchError((httpErrorResponse: HttpErrorResponse) => {
                    console.error(httpErrorResponse.status)
                    let message: string
                    if (httpErrorResponse.error instanceof ErrorEvent) {
                        // A client-side or network error, handle here
                        message = httpErrorResponse.error.message
                        console.error('A client-side or network error occurred:', message)
                    } else {
                        // a server side error, handle here
                        console.error('A server error occurred, httpErrorResponse', httpErrorResponse)
                        if (httpErrorResponse.status === 401) {
                            message = 'Wrong username or password'
                        } else {
                            message = JSON.stringify(httpErrorResponse)
                        }
                    }
                    return throwError(message)
                })
            );
    }

    uploadFile(formData: FormData): Observable<HttpEvent<UploadResponse>> {
        return this.http.post<UploadResponse>(this.serviceUrl + '/fileTransferController/uploadFile', formData, {
            reportProgress: true,
            observe: 'events'
        })
    }
}
