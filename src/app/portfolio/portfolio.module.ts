import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortfolioRoutingModule } from './portfolio-routing.module';
import { PortfolioComponent } from './portfolio.component';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { MessagesModule } from 'primeng/messages';
import { PurgePositionSnapshotComponent } from './purge-position-snapshot/purge-position-snapshot.component';
import { PriceHoldingsComponent } from './price-holdings/price-holdings.component';
import { CheckboxModule } from 'primeng/checkbox';
import { InstrumentDueNotificationTriggerComponent } from './instrument-due-notification-trigger/instrument-due-notification-trigger.component';
import { PortfolioHoldingManagementComponent } from './portfolio-holding-management/portfolio-holding-management.component';
import { InstrumentMaintenanceComponent } from './instrument-maintenance/instrument-maintenance.component';
import { PortfolioMaintenanceComponent } from './portfolio-maintenance/portfolio-maintenance.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FixedIncomeInstrumentReportComponent } from './fixed-income-instrument-report/fixed-income-instrument-report.component';


@NgModule({
    declarations: [
        PortfolioComponent,
        PurgePositionSnapshotComponent,
        PriceHoldingsComponent,
        InstrumentDueNotificationTriggerComponent,
        PortfolioHoldingManagementComponent,
        InstrumentMaintenanceComponent,
        PortfolioMaintenanceComponent,
        FixedIncomeInstrumentReportComponent
    ],
    imports: [
        CommonModule,
        PortfolioRoutingModule,
        FormsModule, ReactiveFormsModule,
        DropdownModule, TableModule, TooltipModule, DialogModule, InputNumberModule, CalendarModule, MessagesModule, CheckboxModule, SelectButtonModule
    ]
})
export class PortfolioModule { }
