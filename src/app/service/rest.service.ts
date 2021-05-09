import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { SessionService } from './session.service';
import { CustomUserDetails } from '../login/CustomUserDetails';
import { LoginResponse } from '../login/LoginResponse';
import { LoginRequest } from '../login/LoginRequest';

@Injectable({
    providedIn: 'root'
})
export class RestService {


    constructor(
        private http: HttpClient,
    ) { }

    getPing() {
        return this.http.get('http://localhost:8080/jwtController/ping');
    }

    authenticate(loginRequest: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>('http://localhost:8080/jwtController/authenticate', loginRequest)
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
                        let serverMessage: any = httpErrorResponse.error
                        message = `${serverMessage.status} ${serverMessage.error} (${serverMessage.message})`
                        console.error('A server error occurred, status code:', httpErrorResponse.status, 'message:', httpErrorResponse.error)
                    }
                    return throwError(message)
                })
            );
    }

}
