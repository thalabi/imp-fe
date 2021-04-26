import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PingComponent } from './ping/ping.component';
import { LoginComponent } from './login/login.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';




const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'ping', component: PingComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', component: Httpstatus404Component }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
