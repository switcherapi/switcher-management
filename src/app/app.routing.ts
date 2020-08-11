import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { SignupTeamComponent } from './signup-team/signup-team.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { NgModule } from '@angular/core';

const routes: Routes = [
    { path: '', component: HomeComponent },

    { path: 'login', component: LoginComponent },

    { path: 'signup', component: SignupComponent },

    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard-module/dashboard.module').then(mod => mod.DashboardModule),
        data: { preload: true }
    },

    {
        path: 'documentation',
        loadChildren: () => import('./documentation-module/documentation-module.module').then(mod => mod.DocumentationModuleModule),
        data: { preload: true }
    },

    { path: 'collab/join', component: SignupTeamComponent, canActivate: [AuthGuard] },

    { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }