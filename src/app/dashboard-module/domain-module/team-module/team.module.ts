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
import { MatTabsModule } from '@angular/material/tabs';
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
import { TeamPendingMembersComponent } from './team-pending-members/team-pending-members.component';
import { Team } from 'src/app/model/team';


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
