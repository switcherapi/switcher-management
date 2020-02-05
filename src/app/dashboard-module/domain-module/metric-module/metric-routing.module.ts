import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/auth/guards/auth.guard';
import { MetricComponent } from './metric/metric.component';
import { DatePipe } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: MetricComponent, canActivate: [AuthGuard]
  }
];

RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' });

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
