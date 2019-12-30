import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainListComponent } from './domain-list/domain-list.component';
import { DomainPreviewComponent } from './domain-preview/domain-preview.component';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DomainRouteService } from './domain/services/domain-route.service';
import { PathRoute } from './domain/model/path-route';

@NgModule({
  declarations: [DomainListComponent, DomainPreviewComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ],
  providers: [ 
    DomainRouteService, 
    PathRoute
  ]
})
export class DashboardModule { }
