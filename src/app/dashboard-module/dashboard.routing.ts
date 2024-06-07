import { NgModule } from '@angular/core';
import { RouterModule, Routes, mapToCanActivate } from '@angular/router';

import { DomainListComponent } from './domain-list/domain-list.component';
import { AuthGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  { path: 'dashboard', component: DomainListComponent, canActivate: mapToCanActivate([AuthGuard]) },

  { 
    path: 'dashboard/domain/:name/:domainid',
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
