import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { DomainRoutingModule } from './domain.routing';

import { DomainRouteService } from 'src/app/services/domain-route.service';
import { DatePipe } from '@angular/common';

@NgModule({
    imports: [
        DomainRoutingModule
    ],
    providers: [
        DomainRouteService,
        DatePipe
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DomainModule { }