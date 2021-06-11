import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { SignupTeamComponent } from './signup-team/signup-team.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { SignupAuthComponent } from './signup-auth/signup-auth.component';
import { LoginResetComponent } from './login-reset/login-reset.component';
import { SignupDomainComponent } from './signup-domain/signup-domain.component';
import { SlackAuthComponent } from './slack-auth/slack-auth.component';

const routes: Routes = [
    { path: '', component: HomeComponent },

    { path: 'login', component: LoginComponent },

    { path: 'login/reset', component: LoginResetComponent },

    { path: 'signup', component: SignupComponent },

    { path: 'signup/confirmation', component: SignupAuthComponent },

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

    { path: 'collab/join', component: SignupTeamComponent, canActivate: [AuthGuard] },

    { path: 'domain/transfer', component: SignupDomainComponent, canActivate: [AuthGuard] },

    { path: 'slack/authorization', component: SlackAuthComponent, canActivate: [AuthGuard] },

    { path: '**', redirectTo: '/dashboard' }
];

export const appRoutingModule = RouterModule.forRoot(routes, { scrollPositionRestoration: 'top', useHash: false });