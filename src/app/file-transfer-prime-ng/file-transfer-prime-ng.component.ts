import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RestService } from '../service/rest.service';
import { UploadResponse } from '../service/UploadResponse';

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
    uploadResponse: UploadResponse = {} as UploadResponse

    constructor(
        private restService: RestService,
    ) { }

    ngOnInit(): void {
    }

    onUploadFile(event: any, uploadComponent: any) {
        console.log('onUploadFile')
        console.log(`event: ${event}, uploadComponent: ${uploadComponent}`)

        const file: File = event.files[0]

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
                                    break
                            }
                        },
                        complete: () => {
                            uploadComponent.clear()
                        },
                        error: (err: string) => {
                            console.error(err)
                        }
                    });
        }
    }

}
