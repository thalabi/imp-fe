import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { UploadResponse } from '../file-transfer/UploadResponse';
import { TableListResponse } from '../file-transfer/TableListResponse';
import { SaveHoldingRequest } from '../portfolio/portfolio-holding-management/SaveHoldingRequest';
import { catchError, concatMap, map } from 'rxjs/operators';
import { PositionSnapshot } from '../portfolio/purge-position-snapshot/PositionSnapshot';
import { IHoldingDetail } from '../portfolio/portfolio-holding-management/IHoldingDetail';
import { InstrumentInterestBearing } from '../portfolio/instrument-maintenance/InstrumentInterestBearing';
import { IPortfolioWithDependentFlags } from '../portfolio/portfolio-maintenance/IPortfolioWithDependentFlags';
import { Portfolio } from '../portfolio/portfolio-holding-management/Portfolio';
import { HolderAndName } from '../portfolio/portfolio-maintenance/HolderAndName';
import { ReportJobResponse } from '../portfolio/ReportJobResponse';

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

    getTableData(tableName: string, pageNumber: number, pageSize: number, sortColumns?: Array<string>, projection?: string): Observable<any> {
        let sortQueryParams: string = ''
        if (sortColumns) {
            console.log('sortColumns', sortColumns)
            sortColumns.forEach(sortColumnAndDirection => {
                sortQueryParams = sortQueryParams + "&sort=" + sortColumnAndDirection
            })
            console.log('sortQueryParams', sortQueryParams)
        }
        const projectionParam: string = projection ? `&projection=${projection}` : ''

        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        console.log('entityNameResource', entityNameResource)
        return this.http.get(this.serviceUrl + '/protected/data-rest/' + entityNameResource + '?page=' + pageNumber + '&size=' + pageSize + sortQueryParams + projectionParam)
    }

    getTableMetaDataAlps(tableName: string): Observable<any> {
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(tableName))
        return this.http.get(this.serviceUrl + '/protected/data-rest/profile/' + entityNameResource)
    }


    getPriceHoldings(sendEmail: boolean) {
        return this.http.get(`${this.serviceUrl}/protected/investmentPortfolioController/priceHoldings?sendEmail=${sendEmail}`);
    }

    getHoldingDetails(portfolioId: number): Observable<any> {
        return this.http.get(`${this.serviceUrl}/protected/investmentPortfolioController/getHoldingDetails?portfolioId=${portfolioId}`)
            .pipe(
                map((data: any): Array<IHoldingDetail> => {
                    const holdingDetailList: Array<IHoldingDetail> = data.holdingDetails
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

    saveHolding(saveHoldingRequest: SaveHoldingRequest): Observable<HttpResponse<any>> {
        return this.http.put<HttpResponse<any>>(`${this.serviceUrl}/protected/investmentPortfolioController/saveHolding`, saveHoldingRequest);
    }
    deleteHolding(holdingId: number): Observable<HttpResponse<void>> {
        return this.http.delete<HttpResponse<void>>(`${this.serviceUrl}/protected/investmentPortfolioController/deleteHolding` + holdingId);
    }

    getDistinctPositionSnapshots(): Observable<Array<PositionSnapshot>> {
        return this.http.get<Array<PositionSnapshot>>(`${this.serviceUrl}/protected/investmentPortfolioController/getDistinctPositionSnapshots`)
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
        return this.http.post<HttpResponse<any>>(`${this.serviceUrl}/protected/investmentPortfolioController/purgePositionSnapshot`, positionSnapshot);
    }

    getCurrencies(): Observable<Array<string>> {
        return this.http.get<Array<string>>(`${this.serviceUrl}/protected/referenceDataController/getCurrencies`);
    }
    getFinancialInstitutions(): Observable<Array<string>> {
        return this.http.get<Array<string>>(`${this.serviceUrl}/protected/referenceDataController/getFinancialInstitutions`);
    }
    getInstrumentTypes(): Observable<Array<string>> {
        return this.http.get<Array<string>>(`${this.serviceUrl}/protected/referenceDataController/getInstrumentTypes`);
    }
    getInterestBearingTypes(): Observable<Array<string>> {
        return this.http.get<Array<string>>(`${this.serviceUrl}/protected/referenceDataController/getInterestBearingTypes`);
    }
    getTerms(): Observable<Array<string>> {
        return this.http.get<Array<string>>(`${this.serviceUrl}/protected/referenceDataController/getTerms`);
    }
    getHolders(): Observable<Array<HolderAndName>> {
        return this.http.get<Array<HolderAndName>>(`${this.serviceUrl}/protected/referenceDataController/getHolders`);
    }
    getRegisteredAccounts(): Observable<Array<string>> {
        return this.http.get<Array<string>>(`${this.serviceUrl}/protected/referenceDataController/getRegisteredAccounts`);
    }

    saveInstrumentInterestBearing(instrumentInterestBearing: InstrumentInterestBearing): Observable<HttpResponse<any>> {
        return this.http.put<HttpResponse<any>>(`${this.serviceUrl}/protected/instrumentController/saveInstrumentInterestBearing`, instrumentInterestBearing);
    }
    deleteInstrumentInterestBearing(instrumentInterestBearing: InstrumentInterestBearing): Observable<HttpResponse<any>> {
        const id = RestService.idFromUrl(instrumentInterestBearing._links.self.href);
        return this.http.delete<HttpResponse<any>>(`${this.serviceUrl}/protected/instrumentController/deleteInstrumentInterestBearing/${id}`);
    }
    getDefaultDaysToNotify(): Observable<number> {
        return this.http.get<number>(`${this.serviceUrl}/protected/instrumentController/getDefaultDaysToNotify`);
    }
    triggerInstrumetDueNotification(daysToNotify: number) {
        return this.http.get(`${this.serviceUrl}/protected/instrumentController/triggerInstrumetDueNotification?daysToNotify=${daysToNotify}`);
    }

    getPortfoliosWithDependentFlags(): Observable<Array<IPortfolioWithDependentFlags>> {
        return this.http.get<Array<IPortfolioWithDependentFlags>>(`${this.serviceUrl}/protected/portfolioController/getPortfoliosWithDependentFlags`);
    }

    savePortfolio(portfolio: Portfolio): Observable<HttpResponse<any>> {
        return this.http.put<HttpResponse<any>>(`${this.serviceUrl}/protected/portfolioController/savePortfolio`, portfolio);
    }
    deletePortfolio(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<HttpResponse<any>>(`${this.serviceUrl}/protected/portfolioController/deletePortfolio/${id}`);
    }

    // generateFixedIncomeInstrumentReport(reportDisposition: string) {
    //     return this.http.post(`${this.serviceUrl}/protected/portfolioController/generateFixedIncomeInstrumentReport?reportDisposition=${reportDisposition}`, undefined);
    // }

    generateFixedIncomeInstrumentReportAndDownload(): Observable<any /*{ reportJobResponse: ReportJobResponse, blob: HttpEvent<Blob> }*/> {
        return this.http.post<ReportJobResponse>(`${this.serviceUrl}/protected/instrumentController/generateFixedIncomeInstrumentReport?reportDisposition=Download`, undefined)
            .pipe(
                map<ReportJobResponse, ReportJobResponse>(reportJobResponse => {
                    console.log('reportJobResponse', reportJobResponse)
                    return reportJobResponse
                }),
                concatMap<ReportJobResponse, Observable<HttpEvent<Blob>>>(reportJobResponse =>
                    this.http.get(`${this.serviceUrl}/protected/instrumentController/downloadFixedIncomeInstrumentReport?filename=${reportJobResponse.filename}`, {
                        reportProgress: true,
                        observe: 'events',
                        responseType: 'blob'
                    }).pipe(
                        map(blob => ({ reportJobResponse: reportJobResponse, blob: blob })),
                        catchError(this.parseErrorBlob)))

            )
    }
    generateFixedIncomeInstrumentReportAndEmail(): Observable<ReportJobResponse> {
        return this.http.post<ReportJobResponse>(`${this.serviceUrl}/protected/instrumentController/generateFixedIncomeInstrumentReport?reportDisposition=Email`, undefined)
    }

    // parses the error from blob to json
    parseErrorBlob(httpErrorResponse: HttpErrorResponse): Observable<any> {
        console.log('httpErrorResponse', httpErrorResponse)
        const reader: FileReader = new FileReader();

        const peekErrorAndReturn = (reader: FileReader) => {
            const errorAsJson = JSON.parse(reader.result as string)
            console.log('errorAsJson', errorAsJson)
            return errorAsJson
        }
        const obs = new Observable((observer: any) => {
            reader.onloadend = (e) => {
                //observer.error(JSON.parse(reader.result as string))
                observer.error(peekErrorAndReturn(reader))
                observer.complete();
            };
        });
        reader.readAsText(httpErrorResponse.error);
        return obs;
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
