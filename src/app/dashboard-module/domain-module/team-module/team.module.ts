import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamComponent } from './team/team.component';
import { TeamPreviewComponent } from './team-preview/team-preview.component';
import { TeamEditComponent } from './team-edit/team-edit.component';
import { TeamRoutingModule } from './team-routing.module';
import { Team } from '../model/team';
import { MatFormFieldModule, MatButtonModule, MatInputModule } from '@angular/material';


@NgModule({
  declarations: [TeamComponent, TeamPreviewComponent, TeamEditComponent],
  imports: [
    CommonModule,
    TeamRoutingModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule
  ],
  providers: [Team]
})
export class TeamModule { }
