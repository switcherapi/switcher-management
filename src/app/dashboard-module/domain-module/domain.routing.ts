import { NgModule }             from '@angular/core';
import { RouterModule, Routes, mapToCanActivate } from '@angular/router';

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
import { ExtSlackComponent } from './ext-slack/ext-slack.component';

const routes: Routes = [
  {
    path: '',
    component: DomainComponent, canActivate: mapToCanActivate([AuthGuard]),
    children: [
      {
        path: '',
        component: DomainDetailComponent, canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'groups',
        component: GroupListComponent, canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'groups/:groupid',
        component: GroupDetailComponent, canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'groups/:groupid/switchers',
        component: ConfigListComponent, canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'groups/:groupid/switchers/:configid',
        component: ConfigDetailComponent, canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'metrics',
        loadChildren: () => import('./metric-module/metric.module').then(mod => mod.MetricModule)
      },
      {
        path: 'change-log',
        component: ChangelogComponent, canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'groups/:groupid/change-log',
        component: ChangelogComponent, canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'groups/:groupid/switchers/:configid/change-log',
        component: ChangelogComponent, canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'components',
        component: ComponentsComponent, canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'environments',
        component: EnvironmentsComponent, canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'teams',
        loadChildren: () => import('./team-module/team.module').then(mod => mod.TeamModule)
      },
      {
        path: 'integration/slack',
        component: ExtSlackComponent, canActivate: mapToCanActivate([AuthGuard])
      },
      { path: '**', redirectTo: '/dashboard/domain' }
    ]
  }
];

RouterModule.forRoot(routes, { 
  scrollPositionRestoration: 'enabled', 
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
export class DomainRoutingModule { }
