import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PingComponent } from './ping/ping.component';
import { LoginComponent } from './login/login.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';
import { FileTransferComponent } from './file-transfer/file-transfer.component';
import { FileTransferPrimeNgComponent } from './file-transfer-prime-ng/file-transfer-prime-ng.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthGuard } from './security/auth.guard';
import { PriceHoldingsComponent } from './price-holdings/price-holdings.component';
import { PortfolioManagementComponent } from './portfolio-management/portfolio-management.component';
import { PurgePositionSnapshotComponent } from './purge-position-snapshot/purge-position-snapshot.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'forgotPassword', component: ForgotPasswordComponent },
    { path: 'resetPassword', component: ResetPasswordComponent },
    { path: 'ping', component: PingComponent, canActivate: [AuthGuard] },
    { path: 'fileTransfer', component: FileTransferComponent, canActivate: [AuthGuard] },
    { path: 'fileTransferPrimeNg', component: FileTransferPrimeNgComponent, canActivate: [AuthGuard] },
    { path: 'priceHoldings', component: PriceHoldingsComponent, canActivate: [AuthGuard] },
    { path: 'purgePositionSnapshot', component: PurgePositionSnapshotComponent, canActivate: [AuthGuard] },
    { path: 'portfolioManagement', component: PortfolioManagementComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', component: Httpstatus404Component }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
