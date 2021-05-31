import { Component, OnInit } from '@angular/core';
import { RestService } from '../service/rest.service';
import { Observable } from 'rxjs';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { UploadResponse } from '../file-transfer-prime-ng/UploadResponse';

@Component({
    selector: 'app-file-transfer',
    templateUrl: './file-transfer.component.html',
    styleUrls: ['./file-transfer.component.css']
})
export class FileTransferComponent implements OnInit {

    file: File = {} as File
    fileName: string = ''
    fileSize: number = 0
    uploadProgressMessage: string = ''
    uploadResponse: UploadResponse = {} as UploadResponse

    constructor(
        private restService: RestService,
    ) { }

    ngOnInit(): void {
    }

    onFileSelected(event: any) {
        console.log('onFileSelected')
        this.file = event.target.files[0]
        // const file: File = event.target.files[0]

        // if (file) {
        //     this.fileName = file.name
        //     const formData = new FormData()
        //     this.fileSize = file.size
        //     console.log('fileSize', this.fileSize)
        //     formData.append('csvFile', file, file.name)
        //     console.log('formData', formData)
        //     this.restService.uploadFile(formData)
        //         .subscribe(
        //             {
        //                 next: (httpEvent: HttpEvent<UploadResponse>) => {
        //                     console.log(httpEvent);
        //                     switch (httpEvent.type) {
        //                         case HttpEventType.Sent:
        //                             this.uploadProgressMessage = `Uploading file "${file.name}" of size ${file.size}.`
        //                             break
        //                         case HttpEventType.UploadProgress:
        //                             if (httpEvent.total) {
        //                                 const percentComplete = Math.round(100 * (httpEvent.loaded / httpEvent.total))
        //                                 this.uploadProgressMessage = `File "${file.name}" is ${percentComplete}% uploaded.`
        //                             }
        //                             break
        //                         case HttpEventType.Response:
        //                             this.uploadResponse = httpEvent.body as UploadResponse;
        //                             console.log('uploadResponse', this.uploadResponse)
        //                             break
        //                     }
        //                 },
        //                 error: (err: string) => {
        //                     console.error(err)
        //                 }
        //             });
        // }
    }
    onUploadFile(event: any) {
        console.log('onUploadFile')

        if (this.file) {
            this.fileName = this.file.name
            this.fileSize = this.file.size
            const formData = new FormData()
            formData.append('csvFile', this.file, this.fileName)
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
                                    console.log('uploadResponse', this.uploadResponse)
                                    break
                            }
                        },
                        error: (err: string) => {
                            console.error(err)
                        }
                    });
        }
    }


    onUploadFilePrimeNg(event: any) {
        console.log('onUploadFilePrimeNg')
        console.log(event)
        this.file = event.files[0]
        this.onUploadFile(event)
    }
}
