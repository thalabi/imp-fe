import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PingComponent } from './ping/ping.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';
import { FileTransferComponent } from './file-transfer/file-transfer.component';
import { AuthGuard } from './auth/auth-guard.service';
import { AuthGuardWithForcedLogin } from './auth/auth-guard-with-forced-login.service';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
    { path: 'welcome', component: WelcomeComponent },
    { path: 'ping', component: PingComponent, canActivate: [AuthGuardWithForcedLogin] },
    { path: 'fileTransferPrimeNg', component: FileTransferComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    { path: 'portfolio', loadChildren: () => import('./portfolio/portfolio.module').then(m => m.PortfolioModule) },
    // don't include leading slash otherwise logoutMeassge query param will not work
    { path: '**', component: Httpstatus404Component }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
