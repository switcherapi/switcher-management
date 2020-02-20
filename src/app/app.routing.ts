import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login';
import { DocumentationComponent } from './documentation/documentation.component';
import { AuthGuard } from './auth/guards/auth.guard';

const routes: Routes = [
    { path: '',   redirectTo: '/login', pathMatch: 'full' },

    { path: 'login', component: LoginComponent },

    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard-module/dashboard.module').then(mod => mod.DashboardModule),
        data: { preload: true }
    },

    { path: 'documentation', component: DocumentationComponent, canActivate: [AuthGuard] },

    { path: '**', redirectTo: '/dashboard' }
];

export const appRoutingModule = RouterModule.forRoot(routes);