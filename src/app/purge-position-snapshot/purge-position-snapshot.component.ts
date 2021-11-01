import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { RestService } from '../service/rest.service';
import { PositionSnapshot } from './PositionSnapshot';

@Component({
    selector: 'app-purge-position-snapshot',
    templateUrl: './purge-position-snapshot.component.html',
    styleUrls: ['./purge-position-snapshot.component.css']
})
export class PurgePositionSnapshotComponent implements OnInit {

    positionSnapshotList: Array<PositionSnapshot> = []
    selectedPositionSnapshot: PositionSnapshot = {} as PositionSnapshot

    // test
    positionSnapshot: PositionSnapshot = {} as PositionSnapshot

    constructor(
        private restService: RestService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.getAllPositionSnapshots()
    }

    private getAllPositionSnapshots() {
        this.restService.getDistinctPositionSnapshots()
            .subscribe(
                {
                    next: (data: Array<PositionSnapshot>) => {
                        console.log('data', data)
                        this.positionSnapshotList = data
                        console.log('this.positionSnapshotList', this.positionSnapshotList)
                        // this.positionSnapshotList.forEach(positionSnapshot => {
                        //     console.log(positionSnapshot.positionSnapshot)
                        //     console.log(positionSnapshot.positionSnapshot.getFullYear())
                        //     console.log(positionSnapshot.positionSnapshot.getMonth())
                        //     console.log(positionSnapshot.positionSnapshot.getDate())
                        // })
                    },
                    complete: () => {
                    }
                    ,
                    // error: (httpErrorResponse: HttpErrorResponse) => {
                    //     this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                    // }
                    error: (response: any) => {
                        this.messageService.add({ severity: 'error', summary: response, detail: response })
                    }
                });
    }

    onChangePortfolio(event: any) {
        console.log('this.selectedPositionSnapshot', this.selectedPositionSnapshot)
    }

    purgePositionSnapshot(event: any) {
        this.restService.purgePositionSnapshot(this.selectedPositionSnapshot)
            .subscribe(
                {
                    next: (response: any) => {
                        console.log('purgePositionSnapshot response', response)
                        this.getAllPositionSnapshots()
                        this.selectedPositionSnapshot = {} as PositionSnapshot
                    },
                    complete: () => {
                        // this.messageService.clear()
                        // this.uploadProgressMessage = '';
                        // this.uploadResponse = {} as UploadResponse;
                        // this.messageService.add({ severity: 'info', summary: '200', detail: this.tableFileDownloadProgressMessage })
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support. ' })
                    }
                });

    }
}
