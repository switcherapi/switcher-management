import { NgModule }             from '@angular/core';
import { RouterModule, Routes, mapToCanActivate } from '@angular/router';
import { TeamComponent } from './team/team.component';
import { AuthGuard } from 'src/app/auth/guards/auth.guard';
import { TeamDetailComponent } from './team-detail/team-detail.component';

const routes: Routes = [
  {
    path: '',
    component: TeamComponent, canActivate: mapToCanActivate([AuthGuard])
  },
  {
    path: ':teamid',
    component: TeamDetailComponent, canActivate: mapToCanActivate([AuthGuard])
  }
];

RouterModule.forRoot(routes, { 
  paramsInheritanceStrategy: 'always' 
});

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class TeamRoutingModule { }
