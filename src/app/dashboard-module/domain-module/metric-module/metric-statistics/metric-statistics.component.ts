import { Component, OnInit, OnDestroy, Input, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { ChartOptions, ChartType, ChartDataset, ChartData } from 'chart.js';
import { MetricComponent } from '../metric/metric.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Metric, MetricData, MetricStatistics } from 'src/app/model/metric';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';

const negativeTemplate = { label: 'False', backgroundColor: '#ffa1b595', borderColor: '#ffa1b5', fill: 'origin' };
const positiveTemplate = { label: 'True', backgroundColor: '#86c7f395', borderColor: '#3c7aa3', fill: 'origin' };

@Component({
  selector: 'app-metric-statistics',
  templateUrl: './metric-statistics.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    './metric-statistics.component.css'
  ]
})
export class MetricStatisticsComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @Input() data: Metric;
  @Input() switcher: string;
  @Input() parent: MetricComponent;
  @Input() environment: string;
  loading = true;

  switcherDateTimeGroupTab: SwitcherDateTimeGroupedTab;
  switchersTab: SwitchersStatisticsTab;
  componentsTab: ComponentsStatisticsTab;
  reasonsTab: ReasonsStatisticsTab;

  constructor(
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    if(!this.data?.statistics)
      return;

    this.loading = true;

    if (this.switcher) {
      this.switcherDateTimeGroupTab = new SwitcherDateTimeGroupedTab(this);
      this.switcherDateTimeGroupTab.loadSwitcherDateTimeGroupView();

      this.reasonsTab = new ReasonsStatisticsTab(this.data.statistics);
      this.reasonsTab.loadReasonsView();
    }

    this.switchersTab = new SwitchersStatisticsTab(this.data.statistics, this.parent);
    this.switchersTab.loadSwitchersView();

    this.componentsTab = new ComponentsStatisticsTab(this.data.statistics);
    this.componentsTab.loadComponentsView();

    this.loading = false;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getSwitcherDateTimeGroupStats(): SwitcherDateTimeGroupedTab {
    return this.switcherDateTimeGroupTab;
  }
  
  getSwitcherStats(): SwitchersStatisticsTab {
    return this.switchersTab;
  }

  getComponentsStats(): ComponentsStatisticsTab {
    return this.componentsTab;
  }

  getReasonsStats(): ReasonsStatisticsTab {
    return this.reasonsTab;
  }

}

export class SwitchersStatisticsTab {
  constructor(
    private statistics: MetricStatistics,
    private parent: MetricComponent
  ) {}

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  public barChartLabels: string[] = [];
  public barChartData: ChartDataset[] = [];

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          display: true
        },
      }
    },
    plugins: {
      legend: {
        display: true
      }
    }
  };

  onClick(event: any) {
    if (event.active.length)
      this.selectSwitcherKey(event.active[0].index);
  }

  selectSwitcherKey(index: number) {
    this.parent.setSwitcherKeyInput(this.barChartLabels[index]);
  }

  public loadSwitchersView(): void {
    const switcherStatistics = this.statistics.switchers;
    let negative = { ...negativeTemplate, data: [] };
    let positive = { ...positiveTemplate, data: [] };

    switcherStatistics.forEach(switcherStats => {
      this.barChartLabels.push(switcherStats.switcher);
      negative.data.push(switcherStats.negative);
      positive.data.push(switcherStats.positive);
    });

    this.barChartData.push(negative);
    this.barChartData.push(positive);
  }
}

export class ComponentsStatisticsTab {
  constructor(private statistics: MetricStatistics) {}

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  public barChartLabels: string[] = [];
  public barChartData: ChartDataset[] = [];

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          display: true
        },
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  public loadComponentsView(): void {
    const componentsStatistics = this.statistics.components;
    let negative = { ...negativeTemplate, data: [] };
    let positive = { ...positiveTemplate, data: [] };

    componentsStatistics.forEach(componentStats => {
      this.barChartLabels.push(componentStats.component);
      negative.data.push(componentStats.negative);
      positive.data.push(componentStats.positive);
    });

    this.barChartData.push(negative);
    this.barChartData.push(positive);
  }
}

export class ReasonsStatisticsTab {
  constructor(private statistics: MetricStatistics) {}

  public chartType: ChartType = 'bar';
  public chartLegend = true;

  public chartLabels: string[] = [];
  public chartData: ChartData<'bar'>;

  public chartOptions: ChartOptions = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      y: {
        ticks: {
          display: true
        }
      }
    },
    plugins: {
      legend: {
        display: true
      }
    }
  };

  public loadReasonsView(): void {
    const reasonsStatistics = this.statistics.reasons;

    this.chartData = {
      labels: [''],
      datasets: []
    };

    reasonsStatistics.forEach(reasonStats => {
      this.chartData.datasets.push({ 
        data: [reasonStats.total], 
        label: reasonStats.reason 
      });
    });
  }

}

export class SwitcherDateTimeGroupedTab {
  constructor(private parent: MetricStatisticsComponent) {
      this.MAX_CONTENT = 5;
      this.content_index = -1;
      this.total_content = 0;
  }

  public chartType: ChartType = 'line';
  public chartLegend = true;

  public selectedData: MetricData[][] = [];
  public chartDatasets: Array<any> = [];
  public chartLabels: Array<any> = [];
  public chartShortLabels: Array<any> = [];

  public chartOptions: ChartOptions = {
    responsive: true,
    elements: {
      line: {
        tension: 0.5
      }
    }
  };

  private MAX_CONTENT: number;
  private content_index: number;
  private total_content: number;

  public loadSwitcherDateTimeGroupView(): void {
    this.chartDatasets = [];
    this.selectedData = [];
    this.chartLabels = [];
    this.chartShortLabels = [];
    
    const switcherStatistics = this.parent.data.statistics.switchers;
    let negative = { ...negativeTemplate, data: [] };
    let positive = { ...positiveTemplate, data: [] };

    switcherStatistics.forEach(switcherStats => {
      this.total_content = switcherStats.dateTimeStatistics.length;

      const stats = switcherStats.dateTimeStatistics;
      for (let index = 0; index < stats.length && index < this.MAX_CONTENT; index++) {
        this.content_index++;
        if (stats[this.content_index]) {
          this.chartLabels.push(stats[this.content_index].date);
          this.chartShortLabels.push(stats[this.content_index].date
            .substring(stats[this.content_index].date.length - 2));
          negative.data.push(stats[this.content_index].negative);
          positive.data.push(stats[this.content_index].positive);
        } else
          break;

      }
    });

    this.chartDatasets.push(negative);
    this.chartDatasets.push(positive);
  }

  hasNext(): boolean {
    return this.content_index < this.total_content - 1;
  }

  hasPrevious(): boolean {
    return (this.content_index - this.MAX_CONTENT) > 0;
  }

  onClick(event: any) {
    if (event.active.length)
        this.expandSelectedData(event.active[0].index);
  }

  onPrevious(): void {
    this.content_index -= this.MAX_CONTENT * 2;
    if (this.content_index < 0) 
      this.content_index = -1;

    this.loadSwitcherDateTimeGroupView();
  }

  pushMetric(swither: string, date: string) {
    const dataFound = this.parent.data.data.filter(data => data.config.key === swither && data.date.toString().indexOf(date) >= 0);
    this.selectedData.push(dataFound);
  }

  expandSelectedData(index: number) {
    this.parent.parent.loadDataMetrics(1, this.parent.environment, this.chartLabels[index], this.chartLabels[index]).subscribe({
      next: (metrics) => {
        if (metrics) {
          this.parent.dialog.open(SwitcherDataStatsDialogComponent, {
            width: '1200px',
            minWidth: window.innerWidth < 450 ? '95vw' : '',
            data: {
              stats: metrics.data,
              switcher: this.parent.switcher,
              parent: this.parent.parent,
              date: this.chartLabels[index]
            }
          });
        }
      },
      error: (error) => {
        ConsoleLogger.printError(error);
      }
    });
  }

  showLabel(): boolean {
    return window.screen.width > 750;
  }
}

@Component({
  selector: 'metric-statistics-data-dialog',
  templateUrl: 'metric-statistics-data-dialog.html',
  styleUrls: [
    '../../common/css/create.component.css'
  ],
  styles: [`
    .btn-cancel {
      float: right;
      margin-right: 10px;
      margin-top: 10px;
      background: #8e8e8e;
    }

    .header-log {
      background: linear-gradient(to right, #549bfb 0, #549bfb, #5298ff 10px, #fff 100%) no-repeat;
      color: white;
      padding: 10px;
      border-radius: 20px;
    }

    @media only screen and (max-width: 510px) {
      :host ::ng-deep .mat-elevation-z8 {
        display: inline-table;
      }
    }
  `]
})
export class SwitcherDataStatsDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SwitcherDataStatsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onClose() {
    this.dialogRef.close();
  }

}