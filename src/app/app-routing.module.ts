import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PingComponent } from './ping/ping.component';
import { LoginComponent } from './login/login.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';
import { FileTransferComponent } from './file-transfer/file-transfer.component';
import { FileTransferPrimeNgComponent } from './file-transfer-prime-ng/file-transfer-prime-ng.component';




const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'ping', component: PingComponent },
    { path: 'fileTransfer', component: FileTransferComponent },
    { path: 'fileTransferPrimeNg', component: FileTransferPrimeNgComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', component: Httpstatus404Component }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
