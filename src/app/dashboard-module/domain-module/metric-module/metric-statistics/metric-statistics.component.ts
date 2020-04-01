import { Component, OnInit, OnDestroy, Input, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { Metric, MetricData } from '../../model/metric';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { MetricComponent } from '../metric/metric.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
  loading = true;

  switcherDateTimeGroupTab: SwitcherDateTimeGroupedTab;
  switchersTab: SwitchersStatisticsTab;
  componentsTab: ComponentsStatisticsTab;
  reasonsTab: ReasonsStatisticsTab;

  constructor(
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if(!this.data || !this.data.statistics)
      return;

    this.loading = true;

    if (this.switcher) {
      this.switcherDateTimeGroupTab = new SwitcherDateTimeGroupedTab(this.data, this.dialog);
      this.switcherDateTimeGroupTab.loadSwitcherDateTimeGroupView();
    }

    this.switchersTab = new SwitchersStatisticsTab(this.data, this.parent);
    this.switchersTab.loadSwitchersView();

    this.componentsTab = new ComponentsStatisticsTab(this.data);
    this.componentsTab.loadComponentsView();

    this.reasonsTab = new ReasonsStatisticsTab(this.data);
    this.reasonsTab.loadReasonsView();

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
    private data: Metric,
    private parent: MetricComponent
  ) {}

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  public barChartLabels: Label[] = [];
  public barChartData: ChartDataSets[] = [];

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
          ticks: {
            min: 0
          }
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    },
    onClick : (evt, array: any) => {
      if (array.length)
        this.selectSwitcherKey(array[0]._index);
    }
  };

  selectSwitcherKey(index: number) {
    this.parent.setSwitcherKeyInput(this.barChartLabels[index].toString());
  }

  public loadSwitchersView(): void {
    const switcherStatistics = this.data.statistics.switchers;
    let negative = { data: [], label: 'Negative' };
    let positive = { data: [], label: 'Positive' };

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
  constructor(private data: Metric) {}

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  public barChartLabels: Label[] = [];
  public barChartData: ChartDataSets[] = [];

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
          ticks: {
            min: 0
          }
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public loadComponentsView(): void {
    const componentsStatistics = this.data.statistics.components;
    let negative = { data: [], label: 'Negative' };
    let positive = { data: [], label: 'Positive' };

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
  constructor(private data: Metric) {}

  public chartType: ChartType = 'pie';
  public chartLegend = true;

  public chartLabels: Label[] = [];
  public chartData: number[] = [];

  public chartColors = [
    {
      backgroundColor: ['rgba(255,0,0,0.3)', 'rgba(0,255,0,0.3)', 'rgba(0,0,255,0.3)'],
    },
  ];

  public chartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
          ticks: {
            min: 0
          }
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public loadReasonsView(): void {
    const reasonsStatistics = this.data.statistics.reasons;

    reasonsStatistics.forEach(reasonStats => {
      this.chartLabels.push(reasonStats.reason);
      this.chartData.push(reasonStats.total);
    });
  }
}

export class SwitcherDateTimeGroupedTab {
  constructor(
    private data: Metric,
    private dialog: MatDialog) {
      this.MAX_CONTENT = 5;
      this.content_index = -1;
      this.total_content = 0;
    }

  public chartType: string = 'line';
  public chartLegend = true;

  public selectedData: MetricData[][] = [];
  public chartDatasets: Array<any> = [];
  public chartLabels: Array<any> = [];
  public chartShortLabels: Array<any> = [];

  public chartColors: Array<any> = [
    {
      backgroundColor: 'rgba(105, 0, 132, .2)',
      borderColor: 'rgba(200, 99, 132, .7)',
      borderWidth: 2,
    },
    {
      backgroundColor: 'rgba(0, 137, 132, .2)',
      borderColor: 'rgba(0, 10, 130, .7)',
      borderWidth: 2,
    }
  ];

  public chartOptions: any = {
    responsive: true,
    onClick : (evt, array) => {
      if (array.length)
        this.expandSelectedData(array[0]._index);
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
    
    const switcherStatistics = this.data.statistics.switchers;
    let negative = { data: [], label: 'Negative' };
    let positive = { data: [], label: 'Positive' };

    switcherStatistics.forEach(switcherStats => {
      this.total_content = switcherStats.dateTimeStatistics.length;

      const stats = switcherStats.dateTimeStatistics;
      for (let index = 0; index < stats.length && index < this.MAX_CONTENT; index++) {
        this.content_index++;
        if (stats[this.content_index]) {
          this.pushMetric(switcherStats.switcher, stats[this.content_index].date);
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

  onPrevious(): void {
    this.content_index -= this.MAX_CONTENT * 2;
    if (this.content_index < 0) 
      this.content_index = -1;

    this.loadSwitcherDateTimeGroupView();
  }

  pushMetric(swither: string, date: string) {
    const dataFound = this.data.data.filter(data => data.config.key === swither && data.date.toString().indexOf(date) >= 0);
    this.selectedData.push(dataFound);
  }

  expandSelectedData(index: number) {
    this.dialog.open(SwitcherDataStatsDialog, {
      width: '1200px',
      data: {
        stats: this.selectedData[index],
        date: this.chartLabels[index]
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
      background: #8e8e8e;
    }
    
    .mat-dialog-content {
      padding-bottom: 20px;
    }

    .header-log {
      background: linear-gradient(to right, #549bfb 0, #549bfb, #5298ff 10px, #fff 100%) no-repeat;
      color: white;
      padding: 10px;
      border-radius: 20px;
    }

    @media only screen and (max-width: 510px) {
      :host /deep/ .mat-elevation-z8 {
        display: inline-table;
      }
    }
  `]
})
export class SwitcherDataStatsDialog {

  constructor(
    public dialogRef: MatDialogRef<SwitcherDataStatsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onClose() {
    this.dialogRef.close();
  }

}