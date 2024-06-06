import '@angular/localize/init';

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { appRoutingModule } from './app.routing';

import { LoginComponent } from './login';
import { DashboardModule } from './dashboard-module/dashboard.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { AuthService } from './auth/services/auth.service';
import { TokenInterceptor } from './auth/token.interceptor';

import { GraphQLModule } from './graphql.module';
import { AppMaterialModule } from './shared/app-material.module';
import { HomeComponent } from './home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignupComponent } from './signup/signup.component';

import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { SignupTeamComponent } from './signup-team/signup-team.component';

import { LocationStrategy, PathLocationStrategy, CommonModule } from '@angular/common';
import { SettingsModule } from './settings-module/settings.module';
import { SignupAuthComponent } from './signup-auth/signup-auth.component';
import { LoginResetComponent } from './login-reset/login-reset.component';
import { SignupDomainComponent } from './signup-domain/signup-domain.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { PwaService } from './services/pwa.service';
import { SlackAuthComponent } from './slack-auth/slack-auth.component';
import { AppVersionComponent } from './app-version/app-version.component';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

@NgModule({
    imports: [
      BrowserModule,
      CommonModule,
      BrowserAnimationsModule,
      ReactiveFormsModule,
      HttpClientModule,
      appRoutingModule,
      GraphQLModule,
      DashboardModule,
      AppMaterialModule,
      NgbModule,
      RecaptchaModule,
      RecaptchaFormsModule,
      SettingsModule,
      ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production })
    ],
    declarations: [
      AppComponent,
      LoginComponent,
      LoginResetComponent,
      HomeComponent,
      SignupComponent,
      SignupAuthComponent,
      SignupTeamComponent,
      SignupDomainComponent,
      SlackAuthComponent,
      AppVersionComponent
    ],
    providers: [
      PwaService,
      AuthGuard,
      AuthService,
      {
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptor,
        multi: true
      },
      { provide: LocationStrategy, useClass: PathLocationStrategy },
      provideCharts(withDefaultRegisterables())
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }