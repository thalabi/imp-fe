import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { RestService } from '../service/rest.service';
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
    uploadProgressMessage: string = ''
    downloadProgressMessage: string = ''
    uploadResponse: UploadResponse = {} as UploadResponse
    fileHasExceptions: boolean = false

    constructor(
        private restService: RestService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
    }

    onSelect(event: any): void {
        console.log('onSelect')
        this.uploadProgressMessage = ''
        this.downloadProgressMessage = ''
        this.uploadResponse = {} as UploadResponse
        this.fileHasExceptions = false
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
                                    if (this.uploadResponse.numberOfLinesWitheExceptions) {
                                        this.fileHasExceptions = true;
                                        this.uploadProgressMessage = this.uploadProgressMessage = `File "${this.fileName}" is uploaded, with errors.`
                                    }
                                    break
                            }
                        },
                        complete: () => {
                            uploadComponent.clear()
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
                                this.downloadProgressMessage = 'Downloading exceptions file'
                                break
                            case HttpEventType.DownloadProgress:
                                console.log('HttpEventType.DownloadProgress')
                                if (httpEvent.total) {
                                    const percentComplete = Math.round(100 * (httpEvent.loaded / httpEvent.total))
                                    this.downloadProgressMessage = `Exceptions file is ${percentComplete}% downloaded.`
                                }
                                break
                            case HttpEventType.Response:
                                console.log('HttpEventType.Response')
                                console.log('httpEvent.headers', httpEvent.headers)
                                const contentDisposition = httpEvent.headers.get('content-disposition')
                                console.log('contentDisposition', contentDisposition)
                                const data: Blob | null = httpEvent.body
                                console.log(data)
                                const exceptionsFileUrl = URL.createObjectURL(data)
                                let exceptionsFileName = '<not provided>'
                                if (contentDisposition) {
                                    exceptionsFileName = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim()
                                    console.log('exceptionsFileName', exceptionsFileName)
                                    const exceptionsFileAnchor = document.createElement("a")
                                    exceptionsFileAnchor.download = exceptionsFileName
                                    exceptionsFileAnchor.href = exceptionsFileUrl
                                    exceptionsFileAnchor.click()
                                } else {
                                    window.open(exceptionsFileUrl)
                                }
                                this.downloadProgressMessage = `File "${exceptionsFileName}" is downloaded.`
                                break;
                        }

                    },
                    complete: () => {

                        this.messageService.clear()
                        this.messageService.add({ severity: 'info', summary: '200', detail: this.downloadProgressMessage })
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        console.error('httpErrorResponse', httpErrorResponse)
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                    }
                });
    }

}
