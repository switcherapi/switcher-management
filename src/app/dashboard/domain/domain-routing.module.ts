import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MetricsComponent } from './metrics/metrics.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { ComponentsComponent } from './components/components.component';
import { EnvironmentsComponent } from './environments/environments.component';
import { LabComponent } from './lab/lab.component';

import { DomainComponent } from './domain/domain.component';
import { DomainDetailComponent } from './domain-detail/domain-detail.component';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { ConfigListComponent } from './config-list/config-list.component';
import { ConfigDetailComponent } from './config-detail/config-detail.component';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { StrategyListComponent } from './strategy-list/strategy-list.component';

const routes: Routes = [
  {
    path: '',
    component: DomainComponent, canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DomainDetailComponent, canActivate: [AuthGuard]
      },
      {
        path: 'groups',
        component: GroupListComponent, canActivate: [AuthGuard]
      },
      {
        path: 'group/detail',
        component: GroupDetailComponent, canActivate: [AuthGuard]
      },
      {
        path: 'group/configs',
        component: ConfigListComponent, canActivate: [AuthGuard]
      },
      {
        path: 'group/config/detail',
        component: ConfigDetailComponent, canActivate: [AuthGuard]
      },
      {
        path: 'metrics',
        component: MetricsComponent, canActivate: [AuthGuard]
      },
      {
        path: 'change-log',
        component: ChangelogComponent, canActivate: [AuthGuard]
      },
      {
        path: 'components',
        component: ComponentsComponent, canActivate: [AuthGuard]
      },
      {
        path: 'environments',
        component: EnvironmentsComponent, canActivate: [AuthGuard]
      },
      {
        path: 'lab',
        component: LabComponent, canActivate: [AuthGuard]
      }
    ]
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
export class DomainRoutingModule { }
