import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PingComponent } from './ping/ping.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';
import { JwtInterceptorService } from './service/jwt-interceptor.service';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        PingComponent,
        Httpstatus404Component
    ],
    imports: [
        BrowserModule,
        // import HttpClientModule after BrowserModule.
        HttpClientModule,
        AppRoutingModule,
        FormsModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
