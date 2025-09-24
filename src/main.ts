import { enableProdMode, importProvidersFrom, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import '@angular/compiler'; // Required for JIT compilation

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, Routes, mapToCanActivate } from '@angular/router';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';

// Import modules and services
import { AuthGuard } from './app/auth/guards/auth.guard';
import { AuthService } from './app/auth/services/auth.service';
import { TokenInterceptor } from './app/auth/token.interceptor';
import { PwaService } from './app/services/pwa.service';
import { RecaptchaV3Module } from './libs/ng-recaptcha-module/lib/recaptcha-v3.module';
import { RECAPTCHA_V3_SITE_KEY } from './libs/ng-recaptcha-module/lib/tokens';
import { ServiceWorkerModule } from '@angular/service-worker';
import { provideCharts, withDefaultRegisterables } from './libs/ng2-charts/src/lib/ng-charts.provider';

// Apollo GraphQL
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

const routes: Routes = [
    { 
        path: '', 
        loadComponent: () => environment.allowHomeView 
            ? import('./app/home/home.component').then(m => m.HomeComponent)
            : import('./app/login').then(m => m.LoginComponent)
    },
    { 
        path: 'login', 
        loadComponent: () => import('./app/login').then(m => m.LoginComponent)
    },
    { 
        path: 'login/reset', 
        loadComponent: () => import('./app/login-reset/login-reset.component').then(m => m.LoginResetComponent)
    },
    { 
        path: 'signup', 
        loadComponent: () => import('./app/signup/signup.component').then(m => m.SignupComponent)
    },
    {
        path: 'settings',
        loadChildren: () => import('./app/settings-module/settings.module').then(mod => mod.SettingsModule),
        data: { preload: true }
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./app/dashboard-module/dashboard.module').then(mod => mod.DashboardModule),
        data: { preload: true }
    },
    {
        path: 'documentation',
        loadChildren: () => import('./app/documentation-module/documentation.module').then(mod => mod.DocumentationModuleModule),
        data: { preload: true }
    },
    { 
        path: 'collab/join', 
        loadComponent: () => import('./app/signup-team/signup-team.component').then(m => m.SignupTeamComponent), 
        canActivate: mapToCanActivate([AuthGuard]) 
    },
    { 
        path: 'domain/transfer', 
        loadComponent: () => import('./app/signup-domain/signup-domain.component').then(m => m.SignupDomainComponent), 
        canActivate: mapToCanActivate([AuthGuard]) 
    },
    { 
        path: 'slack/authorization', 
        loadComponent: () => import('./app/slack-auth/slack-auth.component').then(m => m.SlackAuthComponent), 
        canActivate: mapToCanActivate([AuthGuard]) 
    },
    { path: '**', redirectTo: '/dashboard' }
];

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    PwaService,
    AuthGuard,
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    provideHttpClient(withInterceptorsFromDi()),
    provideCharts(withDefaultRegisterables()),
    provideRouter(routes),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri: `${environment.apiUrl}/adm-graphql` }),
        cache: new InMemoryCache(),
      };
    }),
    importProvidersFrom(
      RecaptchaV3Module,
      ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production })
    ),
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaPublicKey }
  ]
}).catch(err => console.error(err));
