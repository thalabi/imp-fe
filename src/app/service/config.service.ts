import { Injectable } from '@angular/core';
//import { Headers, Response, ResponseContentType } from '@angular/http';

import { catchError, map } from 'rxjs/operators';
// Observale operators
import { Constant } from '../constant';

import { HttpClient } from '@angular/common/http';
import { ApplicationProperties } from '../config/application.properties';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    applicationProperties: ApplicationProperties = {} as ApplicationProperties;

    constructor(private http: HttpClient) { }

    getApplicationProperties() {
        return this.applicationProperties;
    }

    loadConfig() {
        console.log('loadConfig() called');
        return this.http.get<ApplicationProperties>(Constant.APPLICATION_PROPERTIES_FILE)
            .toPromise<ApplicationProperties>()
            .then((config: ApplicationProperties) => {
                this.applicationProperties = config;
            });
    }
}
