import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortfolioComponent } from './portfolio.component';
import { AuthGuard } from '../auth/auth-guard.service';
import { PurgePositionSnapshotComponent } from './purge-position-snapshot/purge-position-snapshot.component';
import { PriceHoldingsComponent } from './price-holdings/price-holdings.component';
import { InstrumentDueNotificationTriggerComponent } from './instrument-due-notification-trigger/instrument-due-notification-trigger.component';
import { PortfolioHoldingManagementComponent } from './portfolio-holding-management/portfolio-holding-management.component';
import { InstrumentMaintenanceComponent } from './instrument-maintenance/instrument-maintenance.component';
import { PortfolioMaintenanceComponent } from './portfolio-maintenance/portfolio-maintenance.component';
import { FixedIncomeInstrumentReportComponent } from './fixed-income-instrument-report/fixed-income-instrument-report.component';

const routes: Routes = [
    { path: '', component: PortfolioComponent },
    { path: 'portfolioHoldingManagement', component: PortfolioHoldingManagementComponent, canActivate: [AuthGuard] },
    { path: 'portfolioMaintenance', component: PortfolioMaintenanceComponent, canActivate: [AuthGuard] },
    { path: 'purgePositionSnapshot', component: PurgePositionSnapshotComponent, canActivate: [AuthGuard] },
    { path: 'priceHoldings', component: PriceHoldingsComponent, canActivate: [AuthGuard] },
    { path: 'instrumentMaintenance', component: InstrumentMaintenanceComponent, canActivate: [AuthGuard] },
    { path: 'instrumentDueNotificationTrigger', component: InstrumentDueNotificationTriggerComponent, canActivate: [AuthGuard] },
    { path: 'fixedIncomeInstrumentReport', component: FixedIncomeInstrumentReportComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PortfolioRoutingModule { }
