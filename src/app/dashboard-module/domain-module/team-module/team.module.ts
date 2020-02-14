import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamComponent } from './team/team.component';
import { TeamPreviewComponent } from './team-preview/team-preview.component';
import { TeamRoutingModule } from './team-routing.module';
import { Team } from '../model/team';
import { MatFormFieldModule, MatButtonModule, MatInputModule, MatSlideToggleModule, MatTableModule, MatPaginatorModule, MatIconModule, MatSortModule, MatExpansionModule, MatTabsModule, MatSelectModule, MatMenuModule, MatListModule, MatCardModule, MatOptionModule, MatDialogModule, MatAutocompleteModule, MatChipsModule, MatToolbarModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamDetailComponent } from './team-detail/team-detail.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TeamMembersComponent } from './team-members/team-members.component';
import { TeamRolesComponent } from './team-roles/team-roles.component';
import { TeamRoleCreateComponent } from './team-role-create/team-role-create.component';
import { BlockUIModule } from 'ng-block-ui';


@NgModule({
  declarations: [
    TeamComponent, 
    TeamPreviewComponent, 
    TeamDetailComponent, 
    TeamMembersComponent, 
    TeamRolesComponent, 
    TeamRoleCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TeamRoutingModule,
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
    BlockUIModule.forRoot()
  ],
  entryComponents: [
    TeamRoleCreateComponent
  ],
  providers: [Team]
})
export class TeamModule { }
