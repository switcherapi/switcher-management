import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamComponent } from './team/team.component';
import { TeamPreviewComponent } from './team-preview/team-preview.component';
import { TeamRoutingModule } from './team.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamDetailComponent } from './team-detail/team-detail.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TeamMembersComponent } from './team-members/team-members.component';
import { TeamPermissionsComponent } from './team-permissions/team-permissions.component';
import { TeamPermissionCreateComponent } from './team-permission-create/team-permission-create.component';
import { TeamPendingMembersComponent } from './team-pending-members/team-pending-members.component';
import { Team } from 'src/app/model/team';
import { AppMaterialModule } from 'src/app/shared/app-material.module';
import { BlockUIComponent } from 'src/app/shared/block-ui/block-ui.component';


@NgModule({
    imports: [
        BlockUIComponent,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        TeamRoutingModule,
        AppMaterialModule,
        TeamComponent,
        TeamPreviewComponent,
        TeamDetailComponent,
        TeamMembersComponent,
        TeamPermissionsComponent,
        TeamPermissionCreateComponent,
        TeamPendingMembersComponent
    ],
    providers: [Team]
})
export class TeamModule { }
