import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings/settings.component';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] }

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
