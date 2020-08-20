import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings/settings.component';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Routes, RouterModule } from '@angular/router';
import { SettingsAccountComponent } from './settings-account/settings-account.component';

const routes: Routes = [
  { path: 'settings', pathMatch: 'full', redirectTo: '/settings/account' },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], children: [
    {
      path: 'account',
      component: SettingsAccountComponent, canActivate: [AuthGuard]
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
