import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainComponent } from './domain/domain.component';

import { DomainRoutingModule } from './domain-routing.module';
import { DomainDetailComponent } from './domain-detail/domain-detail.component';
import { MetricsComponent } from './metrics/metrics.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { ComponentsComponent } from './components/components.component';
import { EnvironmentsComponent } from './environments/environments.component';
import { GroupListComponent } from './group/group-list/group-list.component';
import { GroupPreviewComponent } from './group/group-preview/group-preview.component';
import { GroupDetailComponent } from './group/group-detail/group-detail.component';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DomainRouteService } from '../services/domain-route.service';
import { PathRoute } from './model/path-route';
import { ConfigListComponent } from './config/config-list/config-list.component';
import { ConfigPreviewComponent } from './config/config-preview/config-preview.component';
import { ConfigDetailComponent } from './config/config-detail/config-detail.component';
import { StrategyDetailComponent } from './config/strategy-detail/strategy-detail.component';
import { StrategyListComponent } from './config/strategy-list/strategy-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule, MatSlideToggleModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatMenuModule, MatListModule, MatCardModule, MatOptionModule } from '@angular/material';
import { EnvironmentConfigComponent } from './environment-config/environment-config.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastsContainer } from 'src/app/_helpers/toasts-container.component';

@NgModule({
  declarations: [
    DomainComponent, 
    DomainDetailComponent, 
    MetricsComponent, 
    ChangelogComponent, 
    ComponentsComponent, 
    EnvironmentsComponent, 
    GroupListComponent, 
    GroupPreviewComponent, 
    GroupDetailComponent,
    ConfigListComponent, 
    ConfigPreviewComponent, 
    ConfigDetailComponent, 
    StrategyDetailComponent, 
    StrategyListComponent, 
    EnvironmentConfigComponent,
    ToastsContainer
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    CommonModule,
    DomainRoutingModule,
    MatTabsModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatListModule,
    MatCardModule,
    MatOptionModule
  ],
  providers: [ 
    DomainRouteService, 
    PathRoute
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DomainModule { }
