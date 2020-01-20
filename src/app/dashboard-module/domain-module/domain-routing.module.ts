import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MetricsComponent } from './metrics/metrics.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { ComponentsComponent } from './components/components.component';
import { EnvironmentsComponent } from './environments/environments.component';

import { DomainComponent } from './domain/domain.component';
import { DomainDetailComponent } from './domain-detail/domain-detail.component';
import { GroupListComponent } from './group/group-list/group-list.component';
import { GroupDetailComponent } from './group/group-detail/group-detail.component';
import { ConfigListComponent } from './config/config-list/config-list.component';
import { ConfigDetailComponent } from './config/config-detail/config-detail.component';
import { AuthGuard } from '../../auth/guards/auth.guard';

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
        path: 'group/switchers',
        component: ConfigListComponent, canActivate: [AuthGuard]
      },
      {
        path: 'group/switcher/detail',
        component: ConfigDetailComponent, canActivate: [AuthGuard]
      },
      {
        path: 'metrics',
        component: MetricsComponent, canActivate: [AuthGuard],
        data: {
          title: 'Metrics',
          icon: 1
        }
      },
      {
        path: 'change-log',
        component: ChangelogComponent, canActivate: [AuthGuard],
        data: {
          title: 'Change Log: $',
          icon: 2
        }
      },
      {
        path: 'components',
        component: ComponentsComponent, canActivate: [AuthGuard],
        data: {
          title: 'Components',
          icon: 3
        }
      },
      {
        path: 'environments',
        component: EnvironmentsComponent, canActivate: [AuthGuard],
        data: {
          title: 'Environments',
          icon: 4
        }
      },
      {
        path: 'team',
        loadChildren: () => import('./team-module/team.module').then(mod => mod.TeamModule),
        data: {
          title: 'Teams',
          icon: 6
        }
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
