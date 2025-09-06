import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings/settings.component';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Routes, RouterModule, mapToCanActivate } from '@angular/router';
import { SettingsAccountComponent } from './settings-account/settings-account.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/settings/account' },
  { path: '', component: SettingsComponent, canActivate: [AuthGuard], children: [
    {
      path: 'account',
      component: SettingsAccountComponent, canActivate: mapToCanActivate([AuthGuard])
    }
  ]}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class SettingsRoutingModule { }
