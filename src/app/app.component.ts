import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SessionService } from './service/session.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [MessageService]
})
export class AppComponent {

    constructor(
        private sessionService: SessionService,
    ) { }

    ngOnInit() {
    }
}
