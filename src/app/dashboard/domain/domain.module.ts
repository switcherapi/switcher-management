import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainComponent } from './domain/domain.component';

import { DomainRoutingModule } from './domain-routing.module';
import { DomainDetailComponent } from './domain-detail/domain-detail.component';
import { MetricsComponent } from './metrics/metrics.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { ComponentsComponent } from './components/components.component';
import { EnvironmentsComponent } from './environments/environments.component';
import { LabComponent } from './lab/lab.component';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupPreviewComponent } from './group-preview/group-preview.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';

import { DomainRouteService } from './services/domain-route.service';
import { PathRoute } from './model/path-route';
import { ConfigListComponent } from './config-list/config-list.component';
import { ConfigPreviewComponent } from './config-preview/config-preview.component';
import { ConfigDetailComponent } from './config-detail/config-detail.component';
import { StrategyDetailComponent } from './strategy-detail/strategy-detail.component';
import { StrategyListComponent } from './strategy-list/strategy-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';

@NgModule({
  declarations: [
    DomainComponent, 
    DomainDetailComponent, 
    MetricsComponent, 
    ChangelogComponent, 
    ComponentsComponent, 
    EnvironmentsComponent, 
    LabComponent, 
    GroupListComponent, 
    GroupPreviewComponent, 
    GroupDetailComponent,
    ConfigListComponent, 
    ConfigPreviewComponent, 
    ConfigDetailComponent, 
    StrategyDetailComponent, 
    StrategyListComponent
  ],
  imports: [
    CommonModule,
    DomainRoutingModule,
    MatTabsModule
  ],
  providers: [ 
    DomainRouteService, 
    PathRoute
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DomainModule { }
