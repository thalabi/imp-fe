import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PingComponent } from './ping/ping.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';
import { JwtInterceptorService } from './service/jwt-interceptor.service';
import { ConfigService } from './service/config.service';
import { FileTransferComponent } from './file-transfer/file-transfer.component';


import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { FileUploadModule } from 'primeng/fileupload';
import { FileTransferPrimeNgComponent } from './file-transfer-prime-ng/file-transfer-prime-ng.component';
import { MenubarModule } from 'primeng/menubar';
import { MenuComponent } from './menu/menu.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        PingComponent,
        Httpstatus404Component,
        FileTransferComponent,
        FileTransferPrimeNgComponent,
        MenuComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
    ],
    imports: [
        BrowserModule,
        // import HttpClientModule after BrowserModule.
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        ButtonModule, PasswordModule, FileUploadModule, MenubarModule,
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true },
        { provide: APP_INITIALIZER, deps: [ConfigService], useFactory: (configService: ConfigService) => () => configService.loadConfig(), multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
