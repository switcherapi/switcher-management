import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { MetricService } from 'src/app/dashboard-module/services/metric.service';
import { DomainRouteService } from 'src/app/dashboard-module/services/domain-route.service';
import { Types } from '../../model/path-route';
import { takeUntil } from 'rxjs/operators';
import { Metric } from '../../model/metric';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { MatDialog } from '@angular/material/dialog';
import { MetricFilterComponent } from '../metric-filter/metric-filter.component';

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

  constructor(
    private metricService: MetricService,
    private domainRouteService: DomainRouteService,
    private dialog: MatDialog,
    private errorHandler: RouterErrorHandler
  ) { }

  ngOnInit() {
    this.loadMetrics(this.switcher);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadMetrics(switcher?: string, environment?: string, dateBefore?: string, dateAfter?: string): void {
    this.loading = true;
    this.error = '';
    this.metricService.getMetrics(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id, 
      environment ? environment : 'default', switcher, this.dateGroupPattern, dateBefore, dateAfter)
      .pipe(takeUntil(this.unsubscribe)).subscribe(metrics => {
        this.loading = false;
        if (metrics) {
          this.metrics = metrics;
        } else {
          this.metrics = new Metric();
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
        this.loadMetrics(this.switcher, data.environment, data.dateBefore, data.dateAfter);
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
