import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricComponent } from './metric/metric.component';
import { MetricStatisticsComponent, SwitcherDataStatsDialogComponent } from './metric-statistics/metric-statistics.component';
import { MetricDataComponent } from './metric-data/metric-data.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgChartsModule } from 'ng2-charts';
import { MetricRoutingModule } from './metric.routing';
import { MetricFilterComponent } from './metric-filter/metric-filter.component';
import { Metric } from 'src/app/model/metric';
import { ElementAutocompleteComponent } from '../common/element-autocomplete/element-autocomplete.component';
import { AppMaterialModule } from 'src/app/shared/app-material.module';

@NgModule({
  declarations: [
    MetricComponent, 
    MetricStatisticsComponent, 
    MetricDataComponent,
    SwitcherDataStatsDialogComponent,
    MetricFilterComponent,
    ElementAutocompleteComponent
  ],
  exports: [
    MetricComponent, 
    MetricStatisticsComponent, 
    MetricDataComponent,
    ElementAutocompleteComponent
  ],
  entryComponents: [
    SwitcherDataStatsDialogComponent
  ],
  imports: [
    MetricRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    AppMaterialModule,
    NgChartsModule
  ],
  providers: [Metric],
})
export class MetricModule { }
