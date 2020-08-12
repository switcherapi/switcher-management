import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DomainListComponent } from './domain-list/domain-list.component';
import { AuthGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  { path: 'dashboard', component: DomainListComponent, canActivate: [AuthGuard] },

  { 
    path: 'dashboard/domain',
    loadChildren: () => import('./domain-module/domain.module').then(mod => mod.DomainModule),
    data: { preload: true }
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
export class DashboardRoutingModule { }
