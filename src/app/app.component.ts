import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { environment } from '../environments/environment';
import { AppInfoService } from './service/appInfo.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [MessageService]
})
export class AppComponent {
    clientBuildInfo: string = ''
    serverBuildInfo: string = ''

    constructor(
        private versionService: AppInfoService
    ) { }

    ngOnInit() {
        this.clientBuildInfo = environment.buildVersion + '_' + environment.buildTimestamp;

        this.versionService.getBuildInfo().subscribe({
            next: data => {
                this.serverBuildInfo = data;
                console.log('this.serverBuildInfo: ', this.serverBuildInfo);
            }
        });
    }
}
