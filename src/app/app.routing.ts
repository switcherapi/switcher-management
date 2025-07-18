import { Routes, RouterModule, mapToCanActivate } from '@angular/router';

import { LoginComponent } from './login';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { SignupTeamComponent } from './signup-team/signup-team.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { LoginResetComponent } from './login-reset/login-reset.component';
import { SignupDomainComponent } from './signup-domain/signup-domain.component';
import { SlackAuthComponent } from './slack-auth/slack-auth.component';
import { environment } from 'src/environments/environment';

const routes: Routes = [
    { path: '', component: environment.allowHomeView ? HomeComponent : LoginComponent },

    { path: 'login', component: LoginComponent },

    { path: 'login/reset', component: LoginResetComponent },

    { path: 'signup', component: SignupComponent },

    {
        path: 'settings',
        loadChildren: () => import('./settings-module/settings.module').then(mod => mod.SettingsModule),
        data: { preload: true }
    },

    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard-module/dashboard.module').then(mod => mod.DashboardModule),
        data: { preload: true }
    },

    {
        path: 'documentation',
        loadChildren: () => import('./documentation-module/documentation.module').then(mod => mod.DocumentationModuleModule),
        data: { preload: true }
    },

    { path: 'collab/join', component: SignupTeamComponent, canActivate: mapToCanActivate([AuthGuard]) },

    { path: 'domain/transfer', component: SignupDomainComponent, canActivate: mapToCanActivate([AuthGuard]) },

    { path: 'slack/authorization', component: SlackAuthComponent, canActivate: mapToCanActivate([AuthGuard]) },

    { path: '**', redirectTo: '/dashboard' }
];

export const appRoutingModule = RouterModule.forRoot(routes, { scrollPositionRestoration: 'top', useHash: false });