import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { Metric } from '../../model/metric';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';

@Component({
  selector: 'app-metric-statistics',
  templateUrl: './metric-statistics.component.html',
  styleUrls: ['./metric-statistics.component.css']
})
export class MetricStatisticsComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @Input() data: Metric;
  @Input() switcher: string;
  loading = true;

  switcherDateTimeGroupTab: SwitcherDateTimeGroupedTab;
  switchersTab: SwitchersStatisticsTab;
  componentsTab: ComponentsStatisticsTab;
  reasonsTab: ReasonsStatisticsTab;

  constructor() {}

  ngOnInit() {
    this.loading = true;

    this.switcherDateTimeGroupTab = new SwitcherDateTimeGroupedTab(this.data);
    this.switcherDateTimeGroupTab.loadSwitcherDateTimeGroupView();

    this.switchersTab = new SwitchersStatisticsTab(this.data);
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

  scrollToElement($element): void {
    // if (this.switcher) {
    //   setTimeout(() => {
    //     $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
    //   }, 200);
    // }
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
  constructor(private data: Metric) {}

  public chartType: string = 'line';
  public chartLegend = true;

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
        this.chartLabels.push(dateTimeStats.date);
        negative.data.push(dateTimeStats.negative);
        positive.data.push(dateTimeStats.positive);
      });
    });

    this.chartDatasets.push(negative);
    this.chartDatasets.push(positive);
  }

  public chartOptions: any = {
    responsive: true
  };

}