import { NgModule, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentationComponent } from './documentation/documentation.component';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClientModule } from '@angular/common/http';
import { DocumentationRoutingModule } from './documentation.routing';
import { SetupComponent } from './docs/setup.component';
import { EnvironmentComponent } from './docs/environment.component';
import { HomeComponent } from './docs/home.component';
import { ComponentsComponent } from './docs/components.component';
import { LibJavaComponent } from './docs/lib-java.component';
import { LibJavaScriptComponent } from './docs/lib-javascript.component';
import { MetricsComponent } from './docs/metrics.component';
import { StrategiesComponent } from './docs/strategies.component';
import { TeamComponent } from './docs/team.component';
import { SearchComponent } from './search/search.component';
import { SearchItemComponent } from './search-item/search-item.component';
import { ApiComponent } from './docs/api.component';
import { ShortcutsComponent } from './docs/shortcuts.component';

@NgModule({
  declarations: [
    DocumentationComponent,
    HomeComponent,
    SetupComponent,
    EnvironmentComponent,
    ComponentsComponent,
    LibJavaComponent,
    LibJavaScriptComponent,
    MetricsComponent,
    StrategiesComponent,
    TeamComponent,
    SearchComponent,
    SearchItemComponent,
    ApiComponent,
    ShortcutsComponent
  ],
  imports: [
    CommonModule,
    DocumentationRoutingModule,
    HttpClientModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.NONE
    }),
    MarkdownModule.forChild(),
  ]
})
export class DocumentationModuleModule { }
