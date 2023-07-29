import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortfolioRoutingModule } from './portfolio-routing.module';
import { PortfolioComponent } from './portfolio.component';
import { PortfolioManagementComponent } from './portfolio-management/portfolio-management.component';
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
import { InstrumentManagementComponent } from './instrument-management/instrument-management.component';


@NgModule({
    declarations: [
        PortfolioComponent,
        PortfolioManagementComponent,
        PurgePositionSnapshotComponent,
        PriceHoldingsComponent,
        InstrumentManagementComponent
    ],
    imports: [
        CommonModule,
        PortfolioRoutingModule,
        FormsModule, ReactiveFormsModule,
        DropdownModule, TableModule, TooltipModule, DialogModule, InputNumberModule, CalendarModule, MessagesModule, CheckboxModule
    ]
})
export class PortfolioModule { }