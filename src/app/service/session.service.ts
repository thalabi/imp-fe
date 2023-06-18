import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CustomUserDetails } from '../login/CustomUserDetails';
import { UserInfo } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    private userInfoSource = new BehaviorSubject<UserInfo>({} as UserInfo);
    public userInfoObservable = this.userInfoSource.asObservable();

    constructor() { }

    setUserInfo(userInfo: UserInfo) {
        this.userInfoSource.next(userInfo)
    }
}
