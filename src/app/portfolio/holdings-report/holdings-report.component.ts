import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { FormBuilder } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RestService } from '../../service/rest.service';
import { SessionService } from '../../service/session.service';
import { HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { BatchJobResponse } from '../BatchJobResponse';
import { formatDate } from '@angular/common';
import { ReportJobResponse } from '../ReportJobResponse';

@Component({
    selector: 'app-holdings-report',
    templateUrl: './holdings-report.component.html',
    styleUrls: ['./holdings-report.component.css']
})
export class HoldingsReportComponent extends BaseComponent implements OnInit {

    reportDispositionOptions: Array<string> = ['Download', 'Email']
    reportDisposition: string = 'Download'
    reportJobResponse: ReportJobResponse = {} as ReportJobResponse;
    processingMessage: string = ''

    constructor(
        private restService: RestService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private sessionService: SessionService,
        @Inject(LOCALE_ID) private locale: string
    ) {
        super()
    }

    ngOnInit(): void {
    }

    onChangeReportDisposition(event: any) {
        console.log('onChangeReportDisposition', this.reportDisposition)

    }

    onSubmit(event: any) {
        if (this.reportDisposition === 'Download') {
            this.generateAndDownload()
        } else {
            this.generateAndEmail()
        }
    }
    private generateAndDownload() {
        this.processingMessage = 'Generating report:'
        this.restService.generateHoldinsgReportAndDownload()
            .subscribe(
                {
                    next: (responses) => {
                        console.log('responses', responses)
                        this.reportJobResponse = responses.reportJobResponse
                        const httpEvent: HttpEvent<Blob> = responses.blob
                        // console.log(data.text())
                        // var csvUrl = URL.createObjectURL(data)
                        // console.log('csvUrl', csvUrl)
                        // window.open(csvUrl)
                        console.log('this.reportJobResponse', this.reportJobResponse);
                        console.log('httpEvent', httpEvent);
                        console.log('httpEvent.type', httpEvent.type);
                        switch (httpEvent.type) {
                            case HttpEventType.Sent:
                                console.log('HttpEventType.Sent')
                                this.processingMessage = 'Downloading exceptions file ...'
                                break
                            case HttpEventType.DownloadProgress:
                                console.log('HttpEventType.DownloadProgress')
                                if (httpEvent.total) {
                                    const percentComplete = Math.round(100 * (httpEvent.loaded / httpEvent.total))
                                    this.processingMessage = `File is ${percentComplete}% downloaded.`
                                }
                                break
                            case HttpEventType.Response:
                                console.log('HttpEventType.Response')
                                console.log('httpEvent.headers', httpEvent.headers)
                                const excelFileName = this.downloadFile(httpEvent)
                                this.processingMessage = `File "${excelFileName}" is downloaded.`
                                break;
                        }

                    },
                    complete: () => {

                        this.messageService.clear()
                        this.messageService.add({ severity: 'info', summary: '200', detail: this.processingMessage })
                        console.log('http request completed')

                        this.processingMessage = ''
                        console.log('http request completed 1')
                        const timestampFormatted = formatDate(this.reportJobResponse.timestamp, 'medium', this.locale)
                        console.log('http request completed 2')
                        this.messageService.add({ severity: 'info', summary: '200', detail: `Generated fixed income instrument report at ${timestampFormatted}` })
                        console.log('end of "complete" section')
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.processingMessage = ''
                        console.error('httpErrorResponse', httpErrorResponse)
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })

                    }
                });
    }

    private generateAndEmail() {
        this.restService.generateHoldinsgReportAndEmail()
            .subscribe(
                {
                    next: (reportJobResponse: ReportJobResponse) => {
                        console.log('reportJobResponse', reportJobResponse)
                        this.reportJobResponse = reportJobResponse
                    },
                    complete: () => {
                        console.log('http request completed')
                        const timestampFormatted = formatDate(this.reportJobResponse.timestamp, 'medium', this.locale)
                        this.messageService.add({ severity: 'info', summary: '200', detail: `Generated & emailed fixed income instrument report at ${timestampFormatted}` })
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: this.extractMessage(httpErrorResponse) })
                    }
                });

    }
    /*
    downloads file and return file name
    */
    private downloadFile(httpEvent: HttpResponse<Blob>): string {
        const contentDisposition = httpEvent.headers.get('content-disposition')
        console.log('contentDisposition', contentDisposition)
        const data: Blob = httpEvent.body as Blob
        console.log(data)
        const tableFileUrl = URL.createObjectURL(data)
        let fileName = '<not provided>'
        if (contentDisposition) {
            fileName = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim()
            console.log('fileName', fileName)
            const tableFileAnchor = document.createElement("a")
            tableFileAnchor.download = fileName
            tableFileAnchor.href = tableFileUrl
            tableFileAnchor.click()
        } else {
            window.open(tableFileUrl)
        }
        return fileName
    }

}
