import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainListComponent } from './domain-list/domain-list.component';
import { DomainPreviewComponent } from './domain-preview/domain-preview.component';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DomainRouteService } from './services/domain-route.service';
import { PathRoute } from './domain-module/model/path-route';
import { MatButtonModule } from '@angular/material';

@NgModule({
  declarations: [DomainListComponent, DomainPreviewComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatButtonModule
  ],
  providers: [ 
    DomainRouteService, 
    PathRoute
  ]
})
export class DashboardModule { }
