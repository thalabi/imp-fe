import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { SessionService } from './session.service';

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

    authenticate(username: string, password: string) {
        return this.http.post('http://localhost:8080/jwtController/authenticate', { username, password });
    }
}
