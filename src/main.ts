import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import '@angular/compiler'; // Required for JIT compilation
import '@angular/localize/init';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, Routes, mapToCanActivate } from '@angular/router';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Import modules and services
import { AuthGuard } from './app/auth/guards/auth.guard';
import { AuthService } from './app/auth/services/auth.service';
import { TokenInterceptor } from './app/auth/token.interceptor';
import { PwaService } from './app/services/pwa.service';
import { GraphQLModule } from './app/graphql.module';
import { DashboardModule } from './app/dashboard-module/dashboard.module';
import { AppMaterialModule } from './app/shared/app-material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RecaptchaModule, RecaptchaFormsModule } from './libs/ng-recaptcha-module';
import { SettingsModule } from './app/settings-module/settings.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { provideCharts, withDefaultRegisterables } from './libs/ng2-charts/src/lib/ng-charts.provider';

// Import route components
import { LoginComponent } from './app/login';
import { HomeComponent } from './app/home/home.component';
import { SignupComponent } from './app/signup/signup.component';
import { SignupTeamComponent } from './app/signup-team/signup-team.component';
import { LoginResetComponent } from './app/login-reset/login-reset.component';
import { SignupDomainComponent } from './app/signup-domain/signup-domain.component';
import { SlackAuthComponent } from './app/slack-auth/slack-auth.component';

const routes: Routes = [
    { path: '', component: environment.allowHomeView ? HomeComponent : LoginComponent },
    { path: 'login', component: LoginComponent },
    { path: 'login/reset', component: LoginResetComponent },
    { path: 'signup', component: SignupComponent },
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
    { path: 'collab/join', component: SignupTeamComponent, canActivate: mapToCanActivate([AuthGuard]) },
    { path: 'domain/transfer', component: SignupDomainComponent, canActivate: mapToCanActivate([AuthGuard]) },
    { path: 'slack/authorization', component: SlackAuthComponent, canActivate: mapToCanActivate([AuthGuard]) },
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
    importProvidersFrom(
      ReactiveFormsModule,
      GraphQLModule,
      DashboardModule,
      AppMaterialModule,
      NgbModule,
      RecaptchaModule,
      RecaptchaFormsModule,
      SettingsModule,
      ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production })
    )
  ]
}).catch(err => console.error(err));
