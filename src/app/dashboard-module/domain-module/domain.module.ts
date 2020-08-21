import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainComponent } from './domain/domain.component';

import { DomainRoutingModule } from './domain.routing';
import { DomainDetailComponent } from './domain-detail/domain-detail.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { ComponentsComponent, ComponentEditDialog } from './components/components.component';
import { EnvironmentsComponent } from './environments/environments.component';
import { GroupListComponent } from './group/group-list/group-list.component';
import { GroupPreviewComponent } from './group/group-preview/group-preview.component';
import { GroupDetailComponent } from './group/group-detail/group-detail.component';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ConfigListComponent } from './config/config-list/config-list.component';
import { ConfigPreviewComponent } from './config/config-preview/config-preview.component';
import { ConfigDetailComponent } from './config/config-detail/config-detail.component';
import { StrategyDetailComponent, ChangeLogDialog } from './config/strategy-detail/strategy-detail.component';
import { StrategyListComponent } from './config/strategy-list/strategy-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { EnvironmentConfigComponent } from './environment-config/environment-config.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GroupCreateComponent } from './group/group-create/group-create.component';
import { ConfigCreateComponent } from './config/config-create/config-create.component';
import { ToasterModule } from 'src/app/_helpers/toaster/toaster.module';
import { NgbdModalConfirm } from 'src/app/_helpers/confirmation-dialog';
import { StrategyCreateComponent } from './config/strategy-create/strategy-create.component';
import { StrategyCloneComponent } from './config/strategy-clone/strategy-clone.component';
import { ChartsModule } from 'ng2-charts';
import { BlockUIModule } from 'ng-block-ui';
import { DomainSnapshotComponent } from './domain/domain-snapshot/domain-snapshot.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TeamInviteDialog } from './team-module/team-invite-dialog/team-invite-dialog.component';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { PathRoute } from 'src/app/model/path-route';
import { DomainTransferDialog } from './domain/domain-transfer/domain-transfer-dialog.component';
import { MetricModule } from './metric-module/metric.module';

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
    TeamInviteDialog,
    ChangeLogDialog,
    DomainSnapshotComponent,
    DomainTransferDialog
  ],
  entryComponents: [
    GroupCreateComponent,
    ConfigCreateComponent,
    StrategyCreateComponent,
    NgbdModalConfirm,
    StrategyCloneComponent,
    ComponentEditDialog,
    TeamInviteDialog,
    ChangeLogDialog,
    DomainSnapshotComponent,
    DomainTransferDialog
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
    MatTooltipModule,
    ToasterModule,
    ChartsModule,
    MetricModule,
    BlockUIModule.forRoot()
  ],
  providers: [ 
    DomainRouteService, 
    PathRoute
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DomainModule { }
