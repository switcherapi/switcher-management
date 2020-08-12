import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamComponent } from './team/team.component';
import { AuthGuard } from 'src/app/auth/guards/auth.guard';
import { TeamDetailComponent } from './team-detail/team-detail.component';

const routes: Routes = [
  {
    path: '',
    component: TeamComponent, canActivate: [AuthGuard]
  },
  {
    path: 'detail',
    component: TeamDetailComponent, canActivate: [AuthGuard]
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
