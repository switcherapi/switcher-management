import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DocumentationComponent } from './documentation/documentation.component';
import { SetupComponent } from './docs/setup.component';
import { EnvironmentComponent } from './docs/environment.component';
import { HomeComponent } from './docs/home.component';
import { ComponentsComponent } from './docs/components.component';
import { TeamComponent } from './docs/team.component';
import { PermissionsComponent } from './docs/permissions.component';
import { MetricsComponent } from './docs/metrics.component';
import { StrategiesComponent } from './docs/strategies.component';
import { LibJavaComponent } from './docs/lib-java.component';
import { LibJavaScriptComponent } from './docs/lib-javascript.component';

const routes: Routes = [

  { path: '', component: DocumentationComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'setup', component: SetupComponent },
      { path: 'environment', component: EnvironmentComponent },
      { path: 'components', component: ComponentsComponent },
      { path: 'team', component: TeamComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'metrics', component: MetricsComponent },
      { path: 'strategies', component: StrategiesComponent },
      { path: 'lib_java', component: LibJavaComponent },
      { path: 'lib_javascript', component: LibJavaScriptComponent },
    ]  
  }
  
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class DocumentationRoutingModule { }
