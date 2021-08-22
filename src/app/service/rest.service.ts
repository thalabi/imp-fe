import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ConfigService } from './config.service';
import { UploadResponse } from '../file-transfer-prime-ng/UploadResponse';
import { ForgotPasswordRequest } from '../forgot-password/ForgotPasswordRequest';
import { ResetPasswordRequest } from '../reset-password/ResetPasswordRequest';
import { TableListResponse } from '../file-transfer-prime-ng/TableListResponse';

@Injectable({
    providedIn: 'root'
})
export class RestService {
    readonly serviceUrl: string;
    readonly alpsJsonHeader = new HttpHeaders().set("Content-Type", "application/alps-json"); // used with getting table metadata
    readonly jsonSchemaHeader = new HttpHeaders().set("Accept", "application/schema+json"); // used with getting table metadata
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

    getTableList(): Observable<TableListResponse> {
        return this.http.get<TableListResponse>(this.serviceUrl + '/fileTransferController/getTableList');
    }

    uploadFile(formData: FormData): Observable<HttpEvent<UploadResponse>> {
        return this.http.post<UploadResponse>(this.serviceUrl + '/fileTransferController/uploadFile', formData, {
            reportProgress: true,
            observe: 'events'
        })
    }

    downloadExceptionsFile(exceptionsFile: string): Observable<HttpEvent<Blob>> {
        return this.http.get(this.serviceUrl + '/fileTransferController/downloadExceptionsFile?exceptionsFile=' + exceptionsFile, {
            reportProgress: true,
            observe: 'events',
            responseType: 'blob'
        })
    }

    downloadTable(tableName: string): Observable<HttpEvent<Blob>> {
        return this.http.get(this.serviceUrl + '/fileTransferController/downloadFile?tableName=' + tableName, {
            reportProgress: true,
            observe: 'events',
            responseType: 'blob'
        })
    }

    getTableData(tableName: string, pageNumber: number, pageSize: number): Observable<any> {
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        console.log('entityNameResource', entityNameResource)
        return this.http.get(this.serviceUrl + '/data-rest/' + entityNameResource + '?page=' + pageNumber + '&size=' + pageSize)
    }

    getTableMetaDataAlps(tableName: string): Observable<any> {
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        return this.http.get(this.serviceUrl + '/data-rest/profile/' + entityNameResource)
    }

    forgotPassword(forgotPasswordRequest: ForgotPasswordRequest): Observable<void> {
        return this.http.post<void>(this.serviceUrl + '/securityController/forgotPassword', forgotPasswordRequest)
    }

    resetPassword(resetPassword: ResetPasswordRequest): Observable<void> {
        return this.http.post<void>(this.serviceUrl + '/securityController/resetPassword', resetPassword)
    }


    getPriceHoldings() {
        return this.http.get(this.serviceUrl + '/investmentPortfolioConroller/priceHoldings');
    }

    getHoldingDetails(portfolioId: number): Observable<any> {
        return this.http.get(this.serviceUrl + '/investmentPortfolioConroller/getHoldingDetails?portfolioId=' + portfolioId);
    }



    public static toCamelCase(tableName: string): string {
        return tableName.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()); // convert to camel case
    }
    public static toPlural(entityName: string): string {
        return entityName.endsWith('s') ? entityName + 'es' : entityName + 's'
    }
}
