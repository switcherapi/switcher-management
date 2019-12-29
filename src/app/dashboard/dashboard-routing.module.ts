import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DomainListComponent } from './domain-list/domain-list.component';
import { AuthGuard } from '../auth/guards/auth.guard';

const appRoutes: Routes = [
  { path: 'dashboard',  component: DomainListComponent, canActivate: [AuthGuard] },

  {
    path: 'dashboard/domain',
    loadChildren: () => import('./domain/domain.module').then(mod => mod.DomainModule),
    data: { preload: true }
  }
  
];

@NgModule({
  imports: [
    RouterModule.forChild(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class DashboardRoutingModule { }
