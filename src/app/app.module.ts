import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

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
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MenuComponent } from './menu/menu.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessageModule } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ByteFormatPipe } from './byte-format.pipe';
import { PriceHoldingsComponent } from './price-holdings/price-holdings.component';
import { PortfolioManagementComponent } from './portfolio-management/portfolio-management.component';

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
        ByteFormatPipe,
        PriceHoldingsComponent,
        PortfolioManagementComponent,
    ],
    imports: [
        BrowserModule,
        // import HttpClientModule after BrowserModule.
        HttpClientModule,
        AppRoutingModule,
        FormsModule, ReactiveFormsModule, DialogModule, InputNumberModule, CalendarModule,
        ButtonModule, PasswordModule, FileUploadModule, MenubarModule, BrowserAnimationsModule, MessageModule, DropdownModule, CheckboxModule, TableModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true },
        { provide: APP_INITIALIZER, deps: [ConfigService], useFactory: (configService: ConfigService) => () => configService.loadConfig(), multi: true },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
