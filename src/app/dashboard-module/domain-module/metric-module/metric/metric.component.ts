import { Component, OnInit, OnDestroy, Input, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { MetricService } from 'src/app/dashboard-module/services/metric.service';
import { DomainRouteService } from 'src/app/dashboard-module/services/domain-route.service';
import { Types } from '../../model/path-route';
import { takeUntil } from 'rxjs/operators';
import { Metric } from '../../model/metric';
import { EnvironmentService } from 'src/app/dashboard-module/services/environment.service';
import { Environment } from '../../model/environment';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

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

  filterClass = 'body-filter show';
  loading = true;
  error = '';

  metrics: Metric;
  environments: Environment[];

  environmentSelection = new FormControl('');
  switcherKeyFormControl = new FormControl('');
  dateAfterFormControl = new FormControl('');
  dateBeforeFormControl = new FormControl('');

  constructor(
    private _elRef: ElementRef,
    private metricService: MetricService,
    private environmentService: EnvironmentService,
    private domainRouteService: DomainRouteService,
    private datepipe: DatePipe
  ) { }

  ngOnInit() {
    this.loadMetrics(this.switcher);
    this.loadEnvironments();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadMetrics(switcher?: string, environment?: string, dateBefore?: string, dateAfter?: string): void {
    if (this.switcher) {
      this.switcherKeyFormControl.setValue(switcher);
      this.switcherKeyFormControl.disable({ onlySelf: true })
    }

    this.loading = true;
    this.error = '';
    this.metricService.getMetrics(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id, 
      environment ? environment : 'default', switcher, null, dateBefore, dateAfter)
      .pipe(takeUntil(this.unsubscribe)).subscribe(metrics => {
        this.loading = false;
        this.metrics = metrics;
      }, error => {
        console.log(error);
        this.error = 'Unable to load metrics';
        this.loading = false;
      });
  }

  loadEnvironments() {
    this.environmentService.getEnvironmentsByDomainId(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id)
      .pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.environments = env;
      this.environmentSelection.setValue('default');
    });
  }

  applyFilter() {
    const dateAfter = this.datepipe.transform(this.dateAfterFormControl.value, 'yyyy-MM-dd HH:mm:ss');
    const dateBefore = this.datepipe.transform(this.dateBeforeFormControl.value, 'yyyy-MM-dd HH:mm:ss');
    
    this.loadMetrics(this.switcherKeyFormControl.value, this.environmentSelection.value, dateBefore, dateAfter);

    setTimeout(() => {
      window.document.querySelector('#data-section').scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
    }, 500);
  }

  toggleFilter() {
    if (this.filterClass === 'body-filter show') {
      this.filterClass = 'body-filter hide';
    } else {
      this.filterClass = 'body-filter show';
    }
  }

  scrollToElement($element): void {
    setTimeout(() => {
      $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
    }, 500);
  }

}
