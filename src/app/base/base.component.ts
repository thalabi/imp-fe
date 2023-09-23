import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
    selector: 'app-base',
    templateUrl: './base.component.html',
    styleUrls: ['./base.component.css']
})
export class BaseComponent {

    extractMessage(httpErrorResponse: HttpErrorResponse): string {
        console.log('extractMessage(), httpErrorResponse', httpErrorResponse)
        return (typeof httpErrorResponse.error === 'string') ? httpErrorResponse.error : httpErrorResponse.error.message
        // let message: string = ''

        // if (typeof httpErrorResponse.error === 'string') {
        //     message = httpErrorResponse.message
        // } else {
        //     message = httpErrorResponse.error.message
        // }
        // return message;
    }

}
