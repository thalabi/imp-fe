import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { environment } from '../environments/environment';
import { AppInfoService } from './service/appInfo.service';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { AuthService } from './auth/auth.service';
import { SessionService } from './service/session.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [MessageService]
})
export class AppComponent {
    clientBuildInfo: string = ''
    serverBuildInfo: string = ''

    sessionTimeoutMessage = 'Session timed out due to ' + (+environment.idle.inactivityTimer + +environment.idle.timeoutTimer) / 60 + ' minutes of inactivity'
    idleState: string = 'Not started.'
    disableParentMessages: boolean = false;

    constructor(
        private versionService: AppInfoService, private authService: AuthService, private idle: Idle, private sessionService: SessionService
    ) { }

    ngOnInit() {
        this.clientBuildInfo = environment.buildVersion + '_' + environment.buildTimestamp;

        this.versionService.getBuildInfo().subscribe({
            next: data => {
                this.serverBuildInfo = data;
                console.log('this.serverBuildInfo: ', this.serverBuildInfo);
            }
        });

        // start watching if the user goes idle
        if (this.authService.isLoggedIn()) {
            console.log('this.configureIdle() and start watching ...')
            this.configureIdle()
            this.idle.watch()
        }

        this.sessionService.disableParentMessages$.subscribe(data => this.disableParentMessages = data)
    }

    private configureIdle() {
        console.log('configureIdle()')
        // the plus before the string converts it to number
        this.idle.setIdle(+environment.idle.inactivityTimer); // how long can they be inactive before considered idle, in seconds
        this.idle.setTimeout(+environment.idle.timeoutTimer); // how long can they be idle before considered timed out, in seconds
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES); // provide sources that will "interrupt" aka provide events indicating the user is active

        this.idle.onIdleStart.subscribe(() => {
            this.idleState = 'idleStart'
            console.log('idleState', this.idleState)
        });
        this.idle.onIdleEnd.subscribe(() => {
            this.idleState = 'idleEnd'
            console.log('idleState', this.idleState)
        });
        this.idle.onTimeoutWarning.subscribe((secondsLeft: number) => {
            this.idleState = 'timeoutWarning, seconds left: ' + secondsLeft
            console.log('idleState', this.idleState)
        });
        this.idle.onTimeout.subscribe(() => {
            this.idleState = 'timeout'
            console.log('idleState', this.idleState)

            // force logout due to idle timeout
            this.authService.logout(this.sessionTimeoutMessage)
        })
    }

}
