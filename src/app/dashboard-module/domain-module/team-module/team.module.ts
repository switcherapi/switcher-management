import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamComponent } from './team/team.component';
import { TeamPreviewComponent } from './team-preview/team-preview.component';
import { TeamRoutingModule } from './team.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamDetailComponent } from './team-detail/team-detail.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TeamMembersComponent } from './team-members/team-members.component';
import { TeamRolesComponent } from './team-roles/team-roles.component';
import { TeamRoleCreateComponent } from './team-role-create/team-role-create.component';
import { BlockUIModule } from 'ng-block-ui';
import { TeamPendingMembersComponent } from './team-pending-members/team-pending-members.component';
import { Team } from 'src/app/model/team';
import { AppMaterialModule } from 'src/app/shared/app-material.module';


@NgModule({
  declarations: [
    TeamComponent,
    TeamPreviewComponent,
    TeamDetailComponent,
    TeamMembersComponent,
    TeamRolesComponent,
    TeamRoleCreateComponent,
    TeamPendingMembersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TeamRoutingModule,
    AppMaterialModule,
    BlockUIModule.forRoot()
  ],
  entryComponents: [
    TeamRoleCreateComponent
  ],
  providers: [Team]
})
export class TeamModule { }
