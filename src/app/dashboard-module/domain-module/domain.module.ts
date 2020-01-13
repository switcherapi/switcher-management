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
import { GroupListComponent } from './group/group-list/group-list.component';
import { GroupPreviewComponent } from './group/group-preview/group-preview.component';
import { GroupDetailComponent } from './group/group-detail/group-detail.component';

import { DomainRouteService } from '../services/domain-route.service';
import { PathRoute } from './model/path-route';
import { ConfigListComponent } from './config/config-list/config-list.component';
import { ConfigPreviewComponent } from './config/config-preview/config-preview.component';
import { ConfigDetailComponent } from './config/config-detail/config-detail.component';
import { StrategyDetailComponent } from './config/strategy-detail/strategy-detail.component';
import { StrategyListComponent } from './config/strategy-list/strategy-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AppMaterialModule } from 'src/app/shared/app-material.module';
import { MatButtonModule, MatSlideToggleModule, MatFormFieldModule, MatSelectModule, MatInputModule } from '@angular/material';

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
    MatTabsModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [ 
    DomainRouteService, 
    PathRoute
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DomainModule { }
