import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainComponent } from './domain/domain.component';

import { DomainRoutingModule } from './domain.routing';
import { DomainDetailComponent } from './domain-detail/domain-detail.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { ComponentsComponent, ComponentEditDialogComponent } from './components/components.component';
import { EnvironmentsComponent } from './environments/environments.component';
import { GroupListComponent } from './group/group-list/group-list.component';
import { GroupPreviewComponent } from './group/group-preview/group-preview.component';
import { GroupDetailComponent } from './group/group-detail/group-detail.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ConfigListComponent } from './config/config-list/config-list.component';
import { ConfigPreviewComponent } from './config/config-preview/config-preview.component';
import { ConfigDetailComponent } from './config/config-detail/config-detail.component';
import { StrategyDetailComponent, ChangeLogDialogComponent } from './config/strategy-detail/strategy-detail.component';
import { StrategyListComponent } from './config/strategy-list/strategy-list.component';
import { EnvironmentConfigComponent } from './environment-config/environment-config.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GroupCreateComponent } from './group/group-create/group-create.component';
import { ConfigCreateComponent } from './config/config-create/config-create.component';
import { ToasterModule } from 'src/app/_helpers/toaster/toaster.module';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { StrategyCreateComponent } from './config/strategy-create/strategy-create.component';
import { StrategyCloneComponent } from './config/strategy-clone/strategy-clone.component';
import { BaseChartDirective } from 'ng2-charts';
import { BlockUIModule } from 'ng-block-ui';
import { DomainSnapshotComponent } from './domain/domain-snapshot/domain-snapshot.component';
import { TeamInviteDialogComponent } from './team-module/team-invite-dialog/team-invite-dialog.component';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { DomainTransferDialogComponent } from './domain/domain-transfer/domain-transfer-dialog.component';
import { MetricModule } from './metric-module/metric.module';
import { SpecialCharacterDirective } from './common/special.char.directive';
import { AppMaterialModule } from 'src/app/shared/app-material.module';
import { RelayDetailComponent, RelayVerificationDialogComponent } from './config/relay-detail/relay-detail.component';
import { ExtSlackComponent } from './ext-slack/ext-slack.component';
import { SlackSettingsComponent } from './ext-slack/slack-settings/slack-settings.component';
import { ExtGitOpsComponent } from './ext-gitops/ext-gitops.component';
import { GitOpsSettingsComponent } from './ext-gitops/gitops-settings/gitops-settings.component';
import { GitOpsEnvSelectionComponent } from './ext-gitops/gitops-env-selection/gitops-env-selection.component';

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
    RelayDetailComponent,
    StrategyDetailComponent,
    StrategyListComponent,
    EnvironmentConfigComponent,
    GroupCreateComponent,
    ConfigCreateComponent,
    NgbdModalConfirmComponent,
    StrategyCreateComponent,
    StrategyCloneComponent,
    ComponentEditDialogComponent,
    TeamInviteDialogComponent,
    ChangeLogDialogComponent,
    RelayVerificationDialogComponent,
    DomainSnapshotComponent,
    DomainTransferDialogComponent,
    SpecialCharacterDirective,
    ExtSlackComponent,
    SlackSettingsComponent,
    ExtGitOpsComponent,
    GitOpsSettingsComponent,
    GitOpsEnvSelectionComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    CommonModule,
    ClipboardModule,
    DomainRoutingModule,
    AppMaterialModule,
    ToasterModule,
    BaseChartDirective,
    MetricModule,
    BlockUIModule.forRoot()
  ],
  providers: [
    DomainRouteService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DomainModule { }