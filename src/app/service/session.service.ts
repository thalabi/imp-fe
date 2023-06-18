import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { AuthService, UserInfo } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    private userInfoSource = new BehaviorSubject<UserInfo>({} as UserInfo);
    public userInfo$ = this.userInfoSource.asObservable();

    constructor(private authService: AuthService) {
        this.authService.isAuthenticated$
            .pipe(distinctUntilChanged())
            .subscribe(authenticated => {
                console.log('authenticated', authenticated)
                if (authenticated) {
                    this.authService.getUserInfo().subscribe((userInfo: UserInfo) => {
                        console.log('userInfo', userInfo)
                        this.userInfoSource.next(userInfo)
                    })
                }
            })
    }
}
