import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
    selector: 'app-base',
    templateUrl: './base.component.html',
    styleUrls: ['./base.component.css']
})
export class BaseComponent {

    extractMessage(httpErrorResponse: HttpErrorResponse): string {
        let message: string = ''
        if (typeof httpErrorResponse.error === 'string') {
            message = httpErrorResponse.error
        } else {
            message = httpErrorResponse.error.message
            if (httpErrorResponse.error.detailMessage) {
                message += ` (${httpErrorResponse.error.detailMessage})`
            }
        }
        return message;
    }

}
