import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
    logoutMessage: string = '';

    constructor(private activatedRoute: ActivatedRoute) { }

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(queryParams => {
            this.logoutMessage = queryParams['logoutMessage']
            console.log('logoutMessage:', this.logoutMessage)
            // In a real app: dispatch action to load the details here.
        });
    }
}
