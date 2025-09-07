import { NgModule } from '@angular/core';

import { DashboardRoutingModule } from './dashboard.routing';
import { DomainRouteService } from '../services/domain-route.service';

@NgModule({
    imports: [
        DashboardRoutingModule,
    ],
    providers: [
        DomainRouteService
    ]
})
export class DashboardModule { }
