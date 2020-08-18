import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { MatDialog } from '@angular/material/dialog';
import { MetricFilterComponent } from '../metric-filter/metric-filter.component';
import { Metric } from 'src/app/model/metric';
import { MetricService } from 'src/app/services/metric.service';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';

@Component({
  selector: 'app-metric',
  templateUrl: './metric.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    './metric.component.css']
})
export class MetricComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  @Input() switcher: string;
  dateGroupPattern: string;

  metricViewClass = 'metrics-view graphics';
  filterClass = 'body-filter show';

  classStatus = "loading";
  loading = true;
  error = '';

  metrics: Metric;
  environment: string = 'default';

  constructor(
    private metricService: MetricService,
    private domainRouteService: DomainRouteService,
    private dialog: MatDialog,
    private errorHandler: RouterErrorHandler
  ) { }

  ngOnInit() {
    this.metrics = new Metric();
    if (this.switcher)
      this.loadMetrics(1);
    else
      this.loadMetricStatistics();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadMetricStatistics(environment?: string, dateBefore?: string, dateAfter?: string): void {
    this.loading = true;
    this.error = '';
    this.metricService.getMetricStatistics(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id, 
      environment ? environment : 'default', 'all', this.switcher, this.dateGroupPattern, dateBefore, dateAfter)
      .pipe(takeUntil(this.unsubscribe)).subscribe(statistics => {
        this.loading = false;
        if (statistics) {
          this.metrics.statistics = statistics;
        }
      }, error => {
        ConsoleLogger.printError(error);
        this.errorHandler.doError(error);
        this.loading = false;
      }, () => {
        this.classStatus = "ready";
      });
  }

  public loadDataMetrics(page: number, environment?: string, dateBefore?: string, dateAfter?: string): Observable<Metric> {
    return this.metricService.getMetrics(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id, 
      environment ? environment : 'default', page, this.switcher, this.dateGroupPattern, dateBefore, dateAfter)
        .pipe(takeUntil(this.unsubscribe));
  }

  loadMetrics(page: number, environment?: string, dateBefore?: string, dateAfter?: string): void {
    this.loading = true;
    this.error = '';
    this.loadDataMetrics(page, environment, dateBefore, dateAfter).subscribe(metrics => {
        this.loading = false;
        if (metrics) {
          this.loadMetricStatistics(environment, dateBefore, dateAfter);
          if (this.switcher)
            this.metrics.data = metrics.data;
          else {
            this.metrics.data = null;
          }
        }
      }, error => {
        ConsoleLogger.printError(error);
        this.errorHandler.doError(error);
        this.loading = false;
      }, () => {
        this.classStatus = "ready";
      });
  }

  onFilter(key?: string) {
    if (!key) {
      key = this.switcher;
    }
    const dialogRef = this.dialog.open(MetricFilterComponent, {
      width: '450px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: { 
        switcher: key,
        dateAfter: '',
        dateBefore: '',
        dateGroupPattern: '',
        environment: ''
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        if (data.switcher) {
          this.switcher = data.switcher;
        } else {
          this.switcher = null;
        }
        
        this.dateGroupPattern = data.dateGroupPattern;
        this.environment = data.environment;
        this.loadMetrics(1, data.environment, data.dateBefore, data.dateAfter);
      }
    });
  }

  setSwitcherKeyInput(key: string) {
    this.onFilter(key);
  }

  showData() {
    this.metricViewClass = 'metrics-view data';
  }

  showGraphics() {
    this.metricViewClass = 'metrics-view graphics';
  }
}
