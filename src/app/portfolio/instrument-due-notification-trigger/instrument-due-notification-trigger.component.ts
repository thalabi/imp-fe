import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { BatchJobResponse } from '../price-holdings/BatchJobResponse';
import { RestService } from '../../service/rest.service';
import { MessageService } from 'primeng/api';
import { formatDate } from '@angular/common';

@Component({
    selector: 'app-instrument-due-notification-trigger',
    templateUrl: './instrument-due-notification-trigger.component.html',
    styleUrls: ['./instrument-due-notification-trigger.component.css']
})
export class InstrumentDueNotificationTriggerComponent implements OnInit {
    checkDueDateResponse: BatchJobResponse = {} as BatchJobResponse;
    processingMessage: string = ''
    daysToNotify: number = 0;

    constructor(
        private restService: RestService,
        private messageService: MessageService,
        @Inject(LOCALE_ID) private locale: string

    ) { }


    ngOnInit(): void {
        this.restService.getDefaultDaysToNotify()
            .subscribe(
                {
                    next: (data: number) => {
                        console.log('data', data)
                        this.daysToNotify = data
                    },
                    complete: () => {
                        console.log('http request completed')
                    },
                    error: (response: any) => {
                        this.messageService.add({ severity: 'error', summary: response, detail: response })
                    }
                });

    }

    onSubmit(event: any) {
        this.processingMessage = 'Pricing holdings:'
        this.restService.triggerInstrumetDueNotification(this.daysToNotify)
            .subscribe((data: any) => {
                this.processingMessage = ''
                this.checkDueDateResponse = data
                if (this.checkDueDateResponse.message) {
                    this.messageService.add({ severity: 'error', summary: 'Server error. Please contact support.', detail: this.checkDueDateResponse.message })
                } else {
                    const timestampFormatted = formatDate(this.checkDueDateResponse.timestamp, 'medium', this.locale)
                    this.messageService.add({ severity: 'info', summary: '200', detail: `Instruments due notification completed at ${timestampFormatted}` })
                }
            });
    }

}
