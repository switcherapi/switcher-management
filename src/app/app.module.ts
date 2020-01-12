import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { appRoutingModule } from './app.routing';

import { LoginComponent } from './login';
import { DashboardModule } from './dashboard-module/dashboard.module';
import { DocumentationComponent } from './documentation/documentation.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthGuard } from './auth/guards/auth.guard';
import { AuthService } from './auth/services/auth.service';
import { TokenInterceptor } from './auth/token.interceptor';

import { GraphQLModule } from './graphql.module';
import { AppMaterialModule } from './shared/app-material.module';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        appRoutingModule,
        GraphQLModule,
        DashboardModule,
        NoopAnimationsModule,
        AppMaterialModule
    ],
    declarations: [
        AppComponent,
        LoginComponent,
        DocumentationComponent
    ],
    providers: [
        AuthGuard,
        AuthService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true
        }
      ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }