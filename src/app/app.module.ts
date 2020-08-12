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

import { CookieService } from 'ngx-cookie-service';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { SettingsModule } from './settings-module/settings.module';

@NgModule({
    imports: [
      BrowserModule,
      ReactiveFormsModule,
      HttpClientModule,
      appRoutingModule,
      GraphQLModule,
      DashboardModule,
      AppMaterialModule,
      NgbModule,
      BrowserAnimationsModule,
      RecaptchaModule,
      RecaptchaFormsModule,
      SettingsModule
    ],
    declarations: [
      AppComponent,
      LoginComponent,
      HomeComponent,
      SignupComponent,
      SignupTeamComponent
    ],
    providers: [
      CookieService,
      AuthGuard,
      AuthService,
      {
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptor,
        multi: true
      },
      { provide: LocationStrategy, useClass: PathLocationStrategy }
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }