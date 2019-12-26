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

const domainRoutes: Routes = [
  {
    path: '',
    component: DomainComponent,
    children: [
      {
        path: '',
        component: DomainDetailComponent
      },
      {
        path: 'detail',
        component: DomainDetailComponent
      },
      {
        path: 'groups',
        component: GroupListComponent
      },
      {
        path: 'group/detail',
        component: GroupDetailComponent
      },
      {
        path: 'group/configs',
        component: ConfigListComponent
      },
      {
        path: 'group/config/detail',
        component: ConfigDetailComponent
      },
      {
        path: 'metrics',
        component: MetricsComponent
      },
      {
        path: 'change-log',
        component: ChangelogComponent
      },
      {
        path: 'components',
        component: ComponentsComponent
      },
      {
        path: 'environments',
        component: EnvironmentsComponent
      },
      {
        path: 'lab',
        component: LabComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(domainRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class DomainRoutingModule { }
