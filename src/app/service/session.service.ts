import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CustomUserDetails } from '../login/CustomUserDetails';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    private tokenSource = new BehaviorSubject<string>('');
    private customUserDetailsSource = new BehaviorSubject<CustomUserDetails>({} as CustomUserDetails);
    token = this.tokenSource.asObservable();
    customUserDetails = this.customUserDetailsSource.asObservable();

    constructor() { }

    setToken(token: string) {
        console.log('setToken()')
        this.tokenSource.next(token);
    }
    setCustomUserDetails(customUserDetails: CustomUserDetails) {
        console.log('setCustomUserDetails(), customUserDetails:', customUserDetails)
        this.customUserDetailsSource.next(customUserDetails);
    }
}
