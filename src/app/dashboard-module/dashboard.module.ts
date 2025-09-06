import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard.routing';
import { AppMaterialModule } from '../shared/app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToasterModule } from '../_helpers/toaster/toaster.module';
import { DomainRouteService } from '../services/domain-route.service';

@NgModule({
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
        DomainRouteService
    ]
})
export class DashboardModule { }
