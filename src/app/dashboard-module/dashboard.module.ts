import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainListComponent } from './domain-list/domain-list.component';
import { DomainPreviewComponent } from './domain-preview/domain-preview.component';

import { DashboardRoutingModule } from './dashboard.routing';
import { AppMaterialModule } from '../shared/app-material.module';
import { DomainCreateComponent } from './domain-create/domain-create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToasterModule } from '../_helpers/toaster/toaster.module';
import { DomainRouteService } from '../services/domain-route.service';
import { PathRoute } from '../model/path-route';

@NgModule({
  declarations: [
    DomainListComponent, 
    DomainPreviewComponent,
    DomainCreateComponent
  ],
  entryComponents: [
    DomainCreateComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    AppMaterialModule,
    ToasterModule
  ],
  providers: [ 
    DomainRouteService,
    PathRoute
  ]
})
export class DashboardModule { }
