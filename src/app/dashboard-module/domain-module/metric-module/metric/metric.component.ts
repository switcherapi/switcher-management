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
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

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
  @Input() environment: string = 'default';
  filterType: string = 'Switcher';
  lockFilter: boolean = false;
  dateGroupPattern: string;

  metricViewClass = 'metrics-view graphics';
  filterClass = 'body-filter show';

  classStatus = "loading";
  loading = true;
  error = '';

  metrics: Metric;

  constructor(
    private metricService: MetricService,
    private domainRouteService: DomainRouteService,
    private dialog: MatDialog,
    private errorHandler: RouterErrorHandler
  ) { }

  ngOnInit() {
    this.metrics = new Metric();
    if (this.switcher) {
      this.loadMetrics(1);
      this.lockFilter = true;
    } else
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
      environment ? environment : this.environment, 'all', this.switcher, this.filterType, this.dateGroupPattern, dateBefore, dateAfter)
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
      environment ? environment : this.environment, page, this.switcher, this.dateGroupPattern, dateBefore, dateAfter)
        .pipe(takeUntil(this.unsubscribe));
  }

  loadMetrics(page: number, environment?: string, dateBefore?: string, dateAfter?: string): void {
    this.loading = true;
    this.error = '';
    this.loadDataMetrics(page, environment, dateBefore, dateAfter).subscribe(metrics => {
        this.loading = false;
        this.loadMetricStatistics(environment, dateBefore, dateAfter);
        if (metrics) {
          if (this.switcher && this.filterType === 'Switcher')
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
        lockFilter: this.lockFilter,
        filter: key,
        dateAfter: '',
        dateBefore: '',
        dateGroupPattern: '',
        environment: this.environment
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        if (data.filter) {
          this.switcher = data.filter;
          this.filterType = data.filterType;
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
  
  onTabChange($event: NgbTabChangeEvent) {
    if (this.metricViewClass === 'metrics-view data') {
      this.metricViewClass = 'metrics-view graphics';
    } else {
      this.metricViewClass = 'metrics-view data';
    }
  }
}
