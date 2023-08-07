import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortfolioComponent } from './portfolio.component';
import { PortfolioManagementComponent } from './portfolio-management/portfolio-management.component';
import { AuthGuard } from '../auth/auth-guard.service';
import { PurgePositionSnapshotComponent } from './purge-position-snapshot/purge-position-snapshot.component';
import { PriceHoldingsComponent } from './price-holdings/price-holdings.component';
import { InstrumentManagementComponent } from './instrument-management/instrument-management.component';
import { InstrumentDueNotificationTriggerComponent } from './instrument-due-notification-trigger/instrument-due-notification-trigger.component';

const routes: Routes = [
    { path: '', component: PortfolioComponent },
    { path: 'portfolioManagement', component: PortfolioManagementComponent, canActivate: [AuthGuard] },
    { path: 'purgePositionSnapshot', component: PurgePositionSnapshotComponent, canActivate: [AuthGuard] },
    { path: 'priceHoldings', component: PriceHoldingsComponent, canActivate: [AuthGuard] },
    { path: 'instrumentManagement', component: InstrumentManagementComponent, canActivate: [AuthGuard] },
    { path: 'instrumentDueNotificationTrigger', component: InstrumentDueNotificationTriggerComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PortfolioRoutingModule { }
