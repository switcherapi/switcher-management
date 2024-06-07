import { NgModule } from '@angular/core';
import { RouterModule, Routes, mapToCanActivate } from '@angular/router';
import { AuthGuard } from 'src/app/auth/guards/auth.guard';
import { MetricComponent } from './metric/metric.component';
import { DatePipe } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: MetricComponent, canActivate: mapToCanActivate([AuthGuard])
  }
];

RouterModule.forRoot(routes, { 
  scrollPositionRestoration: 'enabled', 
  paramsInheritanceStrategy: 'always' 
});

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    DatePipe
  ]
})
export class MetricRoutingModule { }
