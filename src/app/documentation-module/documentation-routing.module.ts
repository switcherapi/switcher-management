import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DocumentationComponent } from './documentation/documentation.component';
import { SetupComponent } from './docs/setup.component';
import { EnvironmentComponent } from './docs/environment.component';
import { HomeComponent } from './docs/home.component';
import { ComponentsComponent } from './docs/components.component';
import { TeamComponent } from './docs/team.component';
import { MetricsComponent } from './docs/metrics.component';
import { StrategiesComponent } from './docs/strategies.component';
import { LibJavaComponent } from './docs/lib-java.component';
import { LibJavaScriptComponent } from './docs/lib-javascript.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [

  { path: '', component: DocumentationComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'search/:query', component: SearchComponent },
      { path: 'setup', component: SetupComponent },
      { path: 'environment', component: EnvironmentComponent },
      { path: 'components', component: ComponentsComponent },
      { path: 'team', component: TeamComponent },
      { path: 'metrics', component: MetricsComponent },
      { path: 'strategies', component: StrategiesComponent },
      { path: 'libjava', component: LibJavaComponent },
      { path: 'libjavascript', component: LibJavaScriptComponent },
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
export class DocumentationRoutingModule {}
