import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamComponent } from './team/team.component';
import { AuthGuard } from 'src/app/auth/guards/auth.guard';
import { TeamEditComponent } from './team-edit/team-edit.component';

const routes: Routes = [
  {
    path: '',
    component: TeamComponent, canActivate: [AuthGuard]
  },
  {
    path: 'edit',
    component: TeamEditComponent, canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class TeamRoutingModule { }
