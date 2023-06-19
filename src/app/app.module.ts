import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PingComponent } from './ping/ping.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { FileTransferComponent } from './file-transfer/file-transfer.component';
import { MenubarModule } from 'primeng/menubar';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MenuComponent } from './menu/menu.component';
import { OverlayPanelModule } from 'primeng/overlaypanel'
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ByteFormatPipe } from './byte-format.pipe';
import { TooltipModule } from 'primeng/tooltip';
import { NgIdleModule } from '@ng-idle/core';
import { AuthModule } from './auth/auth.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { MessagesModule } from 'primeng/messages';

@NgModule({
    declarations: [
        AppComponent,
        PingComponent,
        Httpstatus404Component,
        FileTransferComponent,
        MenuComponent,
        ByteFormatPipe,
        WelcomeComponent,
    ],
    imports: [
        BrowserModule,
        // import HttpClientModule after BrowserModule.
        HttpClientModule,
        AuthModule.forRoot(),
        NgIdleModule.forRoot(),
        AppRoutingModule,
        FormsModule,
        InputTextModule, ReactiveFormsModule, DialogModule, InputNumberModule, CalendarModule,
        ButtonModule, FileUploadModule, MenubarModule, OverlayPanelModule, MessagesModule, DropdownModule, CheckboxModule, TableModule, TooltipModule,
    ],
    providers: [
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
