import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { UploadResponse } from '../file-transfer/UploadResponse';
import { TableListResponse } from '../file-transfer/TableListResponse';
import { SaveHoldingRequest } from '../portfolio/portfolio-management/SaveHoldingRequest';
import { map } from 'rxjs/operators';
import { PositionSnapshot } from '../portfolio/purge-position-snapshot/PositionSnapshot';
import { HoldingDetail } from '../portfolio/portfolio-management/HoldingDetail';

@Injectable({
    providedIn: 'root'
})
export class RestService {
    readonly serviceUrl: string;
    readonly alpsJsonHeader = new HttpHeaders().set("Content-Type", "application/alps-json"); // used with getting table metadata
    readonly jsonSchemaHeader = new HttpHeaders().set("Accept", "application/schema+json"); // used with getting table metadata
    readonly multipartHeader = new HttpHeaders().set("Content-Type", "multipart/form-data");

    constructor(
        private http: HttpClient
    ) {
        console.log('environment.production', environment.production); // Logs false for default environment
        console.log('environment', environment)
        this.serviceUrl = environment.beRestServiceUrl
    }

    getPing() {
        return this.http.get(this.serviceUrl + '/pingController/ping');
    }

    getTableList(): Observable<TableListResponse> {
        return this.http.get<TableListResponse>(this.serviceUrl + '/protected/fileTransferController/getTableList');
    }

    uploadFile(formData: FormData): Observable<HttpEvent<UploadResponse>> {
        return this.http.post<UploadResponse>(this.serviceUrl + '/protected/fileTransferController/uploadFile', formData, {
            reportProgress: true,
            observe: 'events'
        })
    }

    downloadExceptionsFile(exceptionsFile: string): Observable<HttpEvent<Blob>> {
        return this.http.get(this.serviceUrl + '/protected/fileTransferController/downloadExceptionsFile?exceptionsFile=' + exceptionsFile, {
            reportProgress: true,
            observe: 'events',
            responseType: 'blob'
        })
    }

    downloadTable(tableName: string): Observable<HttpEvent<Blob>> {
        return this.http.get(this.serviceUrl + '/protected/fileTransferController/downloadFile?tableName=' + tableName, {
            reportProgress: true,
            observe: 'events',
            responseType: 'blob'
        })
    }

    getTableData(tableName: string, pageNumber: number, pageSize: number, sortColumns?: Array<string>): Observable<any> {
        let sortQueryParams: string = ''
        if (sortColumns) {
            console.log('sortColumns', sortColumns)
            sortColumns.forEach(sortColumnAndDirection => {
                sortQueryParams = sortQueryParams + "&sort=" + sortColumnAndDirection
            })
            console.log('sortQueryParams', sortQueryParams)
        }
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        console.log('entityNameResource', entityNameResource)
        return this.http.get(this.serviceUrl + '/protected/data-rest/' + entityNameResource + '?page=' + pageNumber + '&size=' + pageSize + sortQueryParams)
    }

    getTableMetaDataAlps(tableName: string): Observable<any> {
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        return this.http.get(this.serviceUrl + '/protected/data-rest/profile/' + entityNameResource)
    }


    getPriceHoldings(sendEmail: boolean) {
        return this.http.get(`${this.serviceUrl}/protected/investmentPortfolioConroller/priceHoldings?sendEmail=${sendEmail}`);
    }

    getHoldingDetails(portfolioId: number): Observable<any> {
        return this.http.get(`${this.serviceUrl}/protected/investmentPortfolioConroller/getHoldingDetails?portfolioId=${portfolioId}`)
            .pipe(
                map((data: any): Array<HoldingDetail> => {
                    const holdingDetailList: Array<HoldingDetail> = data.holdingDetails
                    holdingDetailList.forEach(holdingDetail => {
                        const asOfDate = holdingDetail.asOfDate
                        console.log('asOfDate', asOfDate)
                        // convert ISO8601 date to Date object
                        holdingDetail.asOfDate = new Date(holdingDetail.asOfDate)
                        holdingDetail.latestPriceTimestamp = new Date(holdingDetail.latestPriceTimestamp)
                    })
                    return data;
                }))
    }

    findByPortfolioIdAndInstrumentIdAndAsOfDate(holding: SaveHoldingRequest): Observable<HttpResponse<Array<SaveHoldingRequest>>> {
        return this.http.get<HttpResponse<Array<SaveHoldingRequest>>>(this.serviceUrl + '/protected/data-rest/holdings/search/findByPortfolioIdAndInstrumentIdAndAsOfDate?portfolioId=10&instrumentId=21&asOfDate=2021-09-23');
    }
    addHolding(saveHoldingRequest: SaveHoldingRequest): Observable<HttpResponse<any>> {
        return this.http.post<HttpResponse<any>>(`${this.serviceUrl}/protected/investmentPortfolioConroller/addHolding/`, saveHoldingRequest);
    }
    updateHolding(saveHoldingRequest: SaveHoldingRequest): Observable<HttpResponse<any>> {
        return this.http.post<HttpResponse<any>>(`${this.serviceUrl}/protected/investmentPortfolioConroller/updateHolding/`, saveHoldingRequest);
    }
    deleteHolding(holdingId: number): Observable<HttpResponse<void>> {
        return this.http.delete<HttpResponse<void>>(`${this.serviceUrl}/protected/data-rest/holdings/` + holdingId);
    }

    getDistinctPositionSnapshots(): Observable<Array<PositionSnapshot>> {
        return this.http.get<Array<PositionSnapshot>>(`${this.serviceUrl}/protected/investmentPortfolioConroller/getDistinctPositionSnapshots`)
            .pipe(
                map((positionSnapshotList): Array<PositionSnapshot> => {
                    positionSnapshotList.forEach((element: { positionSnapshot: any }): void => {
                        const d = element.positionSnapshot
                        console.log('d', d)
                        // convert ISO8601 date to Date object
                        element.positionSnapshot = new Date(element.positionSnapshot)
                    });
                    return positionSnapshotList;
                }))
    }
    purgePositionSnapshot(positionSnapshot: PositionSnapshot): Observable<HttpResponse<any>> {
        return this.http.post<HttpResponse<any>>(`${this.serviceUrl}/protected/investmentPortfolioConroller/purgePositionSnapshot/`, positionSnapshot);
    }

    public static toCamelCase(tableName: string): string {
        return tableName.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()); // convert to camel case
    }
    public static toPlural(entityName: string): string {
        return entityName.endsWith('s') ? entityName + 'es' : entityName + 's'
    }
    public static idFromUrl(url: URL): number {
        const urlString: string = url.toString();
        const id = urlString.substring(urlString.lastIndexOf('/') + 1)
        return +id; // convert string to number
    }
}
