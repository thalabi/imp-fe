import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    private tokenSource = new BehaviorSubject<string>('');
    token = this.tokenSource.asObservable();

    constructor() { }

    setToken(token: string) {
        this.tokenSource.next(token);
    }
}
