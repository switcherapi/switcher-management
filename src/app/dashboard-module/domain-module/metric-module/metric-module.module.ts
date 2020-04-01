import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricComponent } from './metric/metric.component';
import { MetricStatisticsComponent, SwitcherDataStatsDialog } from './metric-statistics/metric-statistics.component';
import { MetricDataComponent } from './metric-data/metric-data.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTabsModule, MatButtonModule, MatSlideToggleModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatMenuModule, MatListModule, MatCardModule, MatOptionModule, MatDialogModule, MatAutocompleteModule, MatChipsModule, MatIconModule, MatTableModule, MatSortModule, MatPaginatorModule, MatExpansionModule, MatToolbarModule, MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { Metric } from '../model/metric';
import { ChartsModule } from 'ng2-charts';
import { MetricRoutingModule } from './metric-routing.module';

@NgModule({
  declarations: [
    MetricComponent, 
    MetricStatisticsComponent, 
    MetricDataComponent,
    SwitcherDataStatsDialog
  ],
  exports: [
    MetricComponent, 
    MetricStatisticsComponent, 
    MetricDataComponent
  ],
  entryComponents: [
    SwitcherDataStatsDialog
  ],
  imports: [
    MetricRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MatTabsModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatListModule,
    MatCardModule,
    MatOptionModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ChartsModule
  ],
  providers: [Metric],
})
export class MetricModuleModule { }
