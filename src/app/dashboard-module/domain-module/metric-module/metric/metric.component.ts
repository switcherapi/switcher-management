import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { MatDialog } from '@angular/material/dialog';
import { MetricFilterComponent } from '../metric-filter/metric-filter.component';
import { Metric } from 'src/app/model/metric';
import { MetricService } from 'src/app/services/metric.service';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
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
  private readonly unsubscribe = new Subject<void>();
  @Input() switcher: string;
  @Input() environment = 'default';
  filterType = 'Switcher';
  lockFilter = false;
  dateGroupPattern: string;

  metricViewClass = 'metrics-view graphics';
  filterClass = 'body-filter show';

  domainId: string;
  domainName: string;
  classStatus = "loading";
  loading = true;
  error = '';
  fetch = true;

  metrics: Metric;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly domainRouteService: DomainRouteService,
    private readonly metricService: MetricService,
    private readonly dialog: MatDialog,
    private readonly errorHandler: RouterErrorHandler
  ) {
    this.activatedRoute.parent.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });

    this.activatedRoute.paramMap
      .pipe(map(() => window.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.fetch = data.navigationId === 1);
   }

  ngOnInit() {
    this.metrics = new Metric();
    
    if (this.switcher) {
      this.loadMetrics(1);
      this.lockFilter = true;
    } else {
      this.loadMetricStatistics();
      this.updateRoute();
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
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
        domainId: this.domainId,
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
  
  onNavChange(_event: NgbNavChangeEvent) {
    if (this.metricViewClass === 'metrics-view data') {
      this.metricViewClass = 'metrics-view graphics';
    } else {
      this.metricViewClass = 'metrics-view data';
    }
  }

  private loadMetricStatistics(environment: string = this.environment, dateBefore?: string, dateAfter?: string): void {
    this.loading = true;
    this.error = '';

    const metricStatisticsRequest = {
      domainId: this.domainId,
      env: environment,
      statistics: 'all',
      key: this.switcher,
      type: this.filterType,
      dateGroupPattern: this.dateGroupPattern,
      dateBefore: dateBefore,
      dateAfter: dateAfter
    };

    this.metricService.getMetricStatistics(metricStatisticsRequest)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: statistics => {
          this.loading = false;
          if (statistics) {
            this.metrics.statistics = statistics;
          }
        },
        error: error => this.onError(error),
        complete: () => this.classStatus = "ready"
      });
  }

  public loadDataMetrics(page: number, environment: string = this.environment, dateBefore?: string, dateAfter?: string): Observable<Metric> {
    return this.metricService.getMetrics(
      this.domainId, environment, page, this.switcher, this.dateGroupPattern, dateBefore, dateAfter)
      .pipe(takeUntil(this.unsubscribe));
  }

  private loadMetrics(page: number, environment?: string, dateBefore?: string, dateAfter?: string): void {
    this.loading = true;
    this.error = '';
    this.loadDataMetrics(page, environment, dateBefore, dateAfter)
    .subscribe({
      next: metrics => {
        this.loading = false;
        this.loadMetricStatistics(environment, dateBefore, dateAfter);
        if (metrics) {
          if (this.switcher && this.filterType === 'Switcher')
            this.metrics.data = metrics.data;
          else {
            this.metrics.data = null;
          }
        }
      },
      error: error => this.onError(error),
      complete: () => this.classStatus = "ready"
    });
  }

  private onError(error: any) {
    ConsoleLogger.printError(error);
    this.errorHandler.doError(error);
    this.loading = false;
  }

  private updateRoute(): void {
    this.domainRouteService.updateView('Metrics', 1);

    if (this.fetch) {
      this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
        `/dashboard/domain/${this.domainName}/${this.domainId}`);
    }
  }
}
