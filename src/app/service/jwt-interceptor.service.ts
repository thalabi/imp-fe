import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
    providedIn: 'root'
})
export class JwtInterceptorService implements HttpInterceptor {

    constructor(private sessionService: SessionService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token: string = '';
        this.sessionService.token.subscribe(message => token = message);
        let jwtReq: HttpRequest<any>;
        if (token) {
            jwtReq = req.clone({
                setHeaders: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
        } else {
            jwtReq = req.clone({
                setHeaders: {
                    'Content-Type': 'application/json',
                }
            })
        }
        return next.handle(jwtReq)
    }
}
