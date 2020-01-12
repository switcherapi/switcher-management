import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainListComponent } from './domain-list/domain-list.component';
import { DomainPreviewComponent } from './domain-preview/domain-preview.component';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DomainRouteService } from './services/domain-route.service';
import { PathRoute } from './domain-module/model/path-route';
import { AppMaterialModule } from '../shared/app-material.module';

@NgModule({
  declarations: [DomainListComponent, DomainPreviewComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    AppMaterialModule
  ],
  providers: [ 
    DomainRouteService, 
    PathRoute
  ]
})
export class DashboardModule { }
