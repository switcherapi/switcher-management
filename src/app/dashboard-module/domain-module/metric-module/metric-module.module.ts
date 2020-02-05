import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricComponent } from './metric/metric.component';
import { MetricStatisticsComponent } from './metric-statistics/metric-statistics.component';
import { MetricDataComponent } from './metric-data/metric-data.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTabsModule, MatButtonModule, MatSlideToggleModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatMenuModule, MatListModule, MatCardModule, MatOptionModule, MatDialogModule, MatAutocompleteModule, MatChipsModule, MatIconModule, MatTableModule, MatSortModule, MatPaginatorModule, MatExpansionModule, MatToolbarModule, MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { Metric } from '../model/metric';
import { ChartsModule } from 'ng2-charts';
import { MetricRoutingModule } from './metric-routing.module';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from 'ngx-mat-datetime-picker';

@NgModule({
  declarations: [
    MetricComponent, 
    MetricStatisticsComponent, 
    MetricDataComponent
  ],
  exports: [
    MetricComponent, 
    MetricStatisticsComponent, 
    MetricDataComponent
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
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    ChartsModule
  ],
  providers: [Metric],
})
export class MetricModuleModule { }
