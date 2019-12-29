import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login';
import { DocumentationComponent } from './documentation/documentation.component';
import { AuthGuard } from './auth/guards/auth.guard';

const routes: Routes = [
    { path: '',   redirectTo: '/login', pathMatch: 'full' },

    { path: 'login', component: LoginComponent },

    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(mod => mod.DashboardModule),
        data: { preload: true }
    },

    {
        path: 'people',
        loadChildren: () => import('./people/people.module').then(mod => mod.PeopleModule),
        data: { preload: true }
    },

    { path: 'documentation', component: DocumentationComponent, canActivate: [AuthGuard] },

    { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);