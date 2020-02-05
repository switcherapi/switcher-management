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
  loading = true;

  switchersTab: SwitchersStatisticsTab;
  componentsTab: ComponentsStatisticsTab;
  reasonsTab: ReasonsStatisticsTab;

  constructor() {}

  ngOnInit() {
    this.loading = true;

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
    window.document.getElementById($element.id).scrollIntoView();
    setTimeout(() => {
      $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
    }, 200);
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

  public loadSwitchersView(): void {
    const switcherStatistics = this.data.statistics.switchers;
    let negative = { data: [], label: 'Failed' };
    let positive = { data: [], label: 'Passed' };

    switcherStatistics.forEach(switcherStats => {
      this.barChartLabels.push(switcherStats.switcher);
      negative.data.push(switcherStats.negative);
      positive.data.push(switcherStats.positive);
    });

    this.barChartData.push(negative);
    this.barChartData.push(positive);
  }

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
}

export class ComponentsStatisticsTab {
  constructor(private data: Metric) {}

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  public barChartLabels: Label[] = [];
  public barChartData: ChartDataSets[] = [];

  public loadComponentsView(): void {
    const componentsStatistics = this.data.statistics.components;
    let negative = { data: [], label: 'Failed' };
    let positive = { data: [], label: 'Passed' };

    componentsStatistics.forEach(componentStats => {
      this.barChartLabels.push(componentStats.component);
      negative.data.push(componentStats.negative);
      positive.data.push(componentStats.positive);
    });

    this.barChartData.push(negative);
    this.barChartData.push(positive);
  }

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
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

  public loadReasonsView(): void {
    const reasonsStatistics = this.data.statistics.reasons;

    reasonsStatistics.forEach(reasonStats => {
      this.chartLabels.push(reasonStats.reason);
      this.chartData.push(reasonStats.total);
    });
  }

  public chartOptions: ChartOptions = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
}