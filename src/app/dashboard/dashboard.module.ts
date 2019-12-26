import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainListComponent } from './domain-list/domain-list.component';
import { DomainPreviewComponent } from './domain-preview/domain-preview.component';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DomainRouteService } from './domain/domain-route/domain-route.service';

@NgModule({
  declarations: [DomainListComponent, DomainPreviewComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
