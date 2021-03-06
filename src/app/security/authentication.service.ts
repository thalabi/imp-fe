import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from '../service/config.service';
import { LoginRequest } from './LoginRequest';
import { LoginResponse } from './LoginResponse';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    readonly serviceUrl: string;

    constructor(
        private http: HttpClient,
        private configService: ConfigService,
    ) {
        const applicationProperties = this.configService.getApplicationProperties();
        this.serviceUrl = applicationProperties.serviceUrl;
    }

    authenticate(loginRequest: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(this.serviceUrl + '/securityController/authenticate', loginRequest/*, { headers: this.jsonHeader }*/)
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

}
