import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login';
import { DocumentationComponent } from './documentation/documentation.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
    { path: '', component: HomeComponent },

    { path: 'login', component: LoginComponent },

    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard-module/dashboard.module').then(mod => mod.DashboardModule),
        data: { preload: true }
    },

    { path: 'documentation', component: DocumentationComponent },

    { path: '**', redirectTo: '/dashboard' }
];

export const appRoutingModule = RouterModule.forRoot(routes);