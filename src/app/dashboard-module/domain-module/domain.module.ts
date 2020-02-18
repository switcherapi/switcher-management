import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainComponent } from './domain/domain.component';

import { DomainRoutingModule } from './domain-routing.module';
import { DomainDetailComponent } from './domain-detail/domain-detail.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { ComponentsComponent, ComponentEditDialog } from './components/components.component';
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
import { StrategyDetailComponent, ChangeLogDialog } from './config/strategy-detail/strategy-detail.component';
import { StrategyListComponent } from './config/strategy-list/strategy-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule, MatSlideToggleModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatMenuModule, MatListModule, MatCardModule, MatOptionModule, MatDialogModule, MatAutocompleteModule, MatChipsModule, MatIconModule, MatTableModule, MatSortModule, MatPaginatorModule, MatExpansionModule, MatToolbarModule, MatCheckboxModule } from '@angular/material';
import { EnvironmentConfigComponent } from './environment-config/environment-config.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GroupCreateComponent } from './group/group-create/group-create.component';
import { ConfigCreateComponent } from './config/config-create/config-create.component';
import { ToasterModule } from 'src/app/_helpers/toaster/toaster.module';
import { NgbdModalConfirm } from 'src/app/_helpers/confirmation-dialog';
import { StrategyCreateComponent } from './config/strategy-create/strategy-create.component';
import { StrategyCloneComponent } from './config/strategy-clone/strategy-clone.component';
import { ChartsModule } from 'ng2-charts';
import { MetricModuleModule } from './metric-module/metric-module.module';
import { BlockUIModule } from 'ng-block-ui';
import { DomainSnapshotComponent } from './domain/domain-snapshot/domain-snapshot.component';

@NgModule({
  declarations: [
    DomainComponent, 
    DomainDetailComponent,
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
    GroupCreateComponent,
    ConfigCreateComponent,
    NgbdModalConfirm,
    StrategyCreateComponent,
    StrategyCloneComponent,
    ComponentEditDialog,
    ChangeLogDialog,
    DomainSnapshotComponent
  ],
  entryComponents: [
    GroupCreateComponent,
    ConfigCreateComponent,
    StrategyCreateComponent,
    NgbdModalConfirm,
    StrategyCloneComponent,
    ComponentEditDialog,
    ChangeLogDialog,
    DomainSnapshotComponent
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
    MatListModule,
    MatCardModule,
    MatOptionModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatToolbarModule,
    MatCheckboxModule,
    ToasterModule,
    ChartsModule,
    MetricModuleModule,
    BlockUIModule.forRoot()
  ],
  providers: [ 
    DomainRouteService, 
    PathRoute
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DomainModule { }
