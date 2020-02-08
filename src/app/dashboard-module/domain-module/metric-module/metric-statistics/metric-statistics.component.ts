import { Component, OnInit, OnDestroy, Input, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { Metric, MetricData } from '../../model/metric';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { MetricComponent } from '../metric/metric.component';

@Component({
  selector: 'app-metric-statistics',
  templateUrl: './metric-statistics.component.html',
  styleUrls: ['./metric-statistics.component.css']
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

    this.switcherDateTimeGroupTab = new SwitcherDateTimeGroupedTab(this.data, this.dialog);
    this.switcherDateTimeGroupTab.loadSwitcherDateTimeGroupView();

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
    private dialog: MatDialog) {}

  public chartType: string = 'line';
  public chartLegend = true;

  public selectedData: MetricData[][] = [];
  public chartDatasets: Array<any> = [];
  public chartLabels: Array<any> = [];

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

  public loadSwitcherDateTimeGroupView(): void {
    const switcherStatistics = this.data.statistics.switchers;
    let negative = { data: [], label: 'Negative' };
    let positive = { data: [], label: 'Positive' };

    switcherStatistics.forEach(switcherStats => {
      switcherStats.dateTimeStatistics.forEach(dateTimeStats => {
        this.pushMetric(switcherStats.switcher, dateTimeStats.date);
        this.chartLabels.push(dateTimeStats.date);
        negative.data.push(dateTimeStats.negative);
        positive.data.push(dateTimeStats.positive);
      });
    });

    this.chartDatasets.push(negative);
    this.chartDatasets.push(positive);
  }

  pushMetric(swither: string, date: string) {
    const dataFound = this.data.data.filter(data => data.config.key === swither && data.date.toString().indexOf(date) >= 0);
    this.selectedData.push(dataFound);
  }

  public chartOptions: any = {
    responsive: true,
    onClick : (evt, array) => {
      if (array.length)
        this.expandSelectedData(array[0]._index);
    }
  };

  expandSelectedData(index: number) {
    this.dialog.open(SwitcherDataStatsDialog, {
      width: '1200px',
      data: {
        stats: this.selectedData[index],
        date: this.chartLabels[index]
      }
    });
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
  `]
})
export class SwitcherDataStatsDialog {

  constructor(
    public dialogRef: MatDialogRef<SwitcherDataStatsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: MetricData[]) { }

  onClose() {
    this.dialogRef.close();
  }

}