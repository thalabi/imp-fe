import { HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { RestService } from '../service/rest.service';
import { TableListResponse } from './TableListResponse';
import { UploadResponse } from './UploadResponse';

@Component({
    selector: 'app-file-transfer-prime-ng',
    templateUrl: './file-transfer-prime-ng.component.html',
    styleUrls: ['./file-transfer-prime-ng.component.css']
})
export class FileTransferPrimeNgComponent implements OnInit {

    //file: File = {} as File
    fileName: string = ''
    fileSize: number = 0
    truncateTable: boolean = false
    uploadProgressMessage: string = ''
    exceptionsFileDownloadProgressMessage: string = ''
    tableFileDownloadProgressMessage: string = ''
    uploadResponse: UploadResponse = {} as UploadResponse
    fileHasExceptions: boolean = false

    tableList: string[] = {} as string[];//= ['sales', 'sales2', 'sales3', 'bio_stats']
    selectedTable: string = ''

    constructor(
        private restService: RestService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.restService.getTableList()
            .subscribe((data: TableListResponse) => {
                this.tableList = data.tableList
                // console.log(this.tableList)
                console.log(this.tableList)
            });
    }

    onChangeTable(event: any) {
        this.truncateTable = false
    }

    onSelectFile(event: any): void {
        console.log('onSelect')
        const file: File = event.files[0]
        this.fileName = file.name
        this.fileSize = file.size

        this.uploadProgressMessage = ''
        this.exceptionsFileDownloadProgressMessage = ''
        this.tableFileDownloadProgressMessage = ''
        this.uploadResponse = {} as UploadResponse
        this.fileHasExceptions = false
        this.truncateTable = false
        this.messageService.clear()
    }

    onUploadFile(event: any, uploadComponent: any) {
        console.log('onUploadFile')
        console.log(`event: ${event}, uploadComponent: ${uploadComponent}`)
        this.messageService.clear()
        const file: File = event.files[0]
        this.fileHasExceptions = false;

        console.log('file', file)
        if (file) {
            this.fileName = file.name
            this.fileSize = file.size
            const formData = new FormData()
            formData.append('csvFile', file, this.fileName)
            formData.append('tableName', this.selectedTable)
            formData.append('truncateTable', String(this.truncateTable))
            console.log('formData', formData)
            this.restService.uploadFile(formData)
                .subscribe(
                    {
                        next: (httpEvent: HttpEvent<UploadResponse>) => {
                            console.log(httpEvent);
                            switch (httpEvent.type) {
                                case HttpEventType.Sent:
                                    this.uploadProgressMessage = `Uploading file "${this.fileName}" of size ${this.fileSize}.`
                                    break
                                case HttpEventType.UploadProgress:
                                    if (httpEvent.total) {
                                        const percentComplete = Math.round(100 * (httpEvent.loaded / httpEvent.total))
                                        this.uploadProgressMessage = `File "${this.fileName}" is ${percentComplete}% uploaded.`
                                    }
                                    break
                                case HttpEventType.Response:
                                    this.uploadResponse = httpEvent.body as UploadResponse;
                                    this.uploadProgressMessage = `File "${this.fileName}" is uploaded.`
                                    console.log('uploadResponse', this.uploadResponse)
                                    if (this.uploadResponse.exceptionsFileName) {
                                        this.fileHasExceptions = true;
                                        this.uploadProgressMessage = this.uploadProgressMessage = `File "${this.fileName}" is uploaded, with errors.`
                                    }
                                    break
                            }
                        },
                        complete: () => {
                            uploadComponent.clear() // clear the selected file in component
                            this.messageService.clear()
                            this.messageService.add({ severity: this.fileHasExceptions ? 'warn' : 'info', summary: '200', detail: this.uploadProgressMessage })
                        },
                        error: (httpErrorResponse: HttpErrorResponse) => {
                            console.error('httpErrorResponse', httpErrorResponse)
                            this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                        }
                    });
        }
    }

    onDownloadExceptionsFile(event: any): void {
        console.log('onDownloadExceptionsFile')
        this.messageService.clear()
        this.restService.downloadExceptionsFile(this.uploadResponse.exceptionsFileName)
            .subscribe(
                {
                    next: (httpEvent: HttpEvent<Blob>) => {
                        // console.log(data.text())
                        // var csvUrl = URL.createObjectURL(data)
                        // console.log('csvUrl', csvUrl)
                        // window.open(csvUrl)
                        console.log('httpEvent.type.type', httpEvent.type);
                        switch (httpEvent.type) {
                            case HttpEventType.Sent:
                                console.log('HttpEventType.Sent')
                                this.exceptionsFileDownloadProgressMessage = 'Downloading exceptions file'
                                break
                            case HttpEventType.DownloadProgress:
                                console.log('HttpEventType.DownloadProgress')
                                if (httpEvent.total) {
                                    const percentComplete = Math.round(100 * (httpEvent.loaded / httpEvent.total))
                                    this.exceptionsFileDownloadProgressMessage = `Exceptions file is ${percentComplete}% downloaded.`
                                }
                                break
                            case HttpEventType.Response:
                                console.log('HttpEventType.Response')
                                console.log('httpEvent.headers', httpEvent.headers)
                                const exceptionsFileName = this.downloadFile(httpEvent)
                                this.exceptionsFileDownloadProgressMessage = `File "${exceptionsFileName}" is downloaded.`
                                break;
                        }

                    },
                    complete: () => {

                        this.messageService.clear()
                        this.messageService.add({ severity: 'info', summary: '200', detail: this.exceptionsFileDownloadProgressMessage })
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        console.error('httpErrorResponse', httpErrorResponse)
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                    }
                });
    }

    onDownloadTable(event: any): void {
        console.log('onDownloadTable')
        this.messageService.clear()
        this.restService.downloadTable(this.selectedTable)
            .subscribe(
                {
                    next: (httpEvent: HttpEvent<Blob>) => {
                        // console.log(data.text())
                        // var csvUrl = URL.createObjectURL(data)
                        // console.log('csvUrl', csvUrl)
                        // window.open(csvUrl)
                        console.log('httpEvent.type.type', httpEvent.type);
                        switch (httpEvent.type) {
                            case HttpEventType.Sent:
                                console.log('HttpEventType.Sent')
                                this.tableFileDownloadProgressMessage = 'Downloading table file'
                                break
                            case HttpEventType.DownloadProgress:
                                console.log('HttpEventType.DownloadProgress')
                                if (httpEvent.total) {
                                    const percentComplete = Math.round(100 * (httpEvent.loaded / httpEvent.total))
                                    this.tableFileDownloadProgressMessage = `Table file is ${percentComplete}% downloaded.`
                                }
                                break
                            case HttpEventType.Response:
                                console.log('HttpEventType.Response')
                                console.log('httpEvent.headers', httpEvent.headers)
                                const tableFileName = this.downloadFile(httpEvent)
                                this.tableFileDownloadProgressMessage = `File "${tableFileName}" is downloaded.`
                                break;
                        }

                    },
                    complete: () => {
                        this.messageService.clear()
                        this.uploadProgressMessage = '';
                        this.uploadResponse = {} as UploadResponse;
                        this.messageService.add({ severity: 'info', summary: '200', detail: this.tableFileDownloadProgressMessage })
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        console.error('httpErrorResponse', httpErrorResponse)
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                    }
                });
    }

    /*
    downloads file and return file name
    */
    private downloadFile(httpEvent: HttpResponse<Blob>): string {
        const contentDisposition = httpEvent.headers.get('content-disposition')
        console.log('contentDisposition', contentDisposition)
        const data: Blob | null = httpEvent.body
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
