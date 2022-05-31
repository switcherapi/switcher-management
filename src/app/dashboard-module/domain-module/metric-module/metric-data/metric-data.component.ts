import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { trigger, state, style } from '@angular/animations';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MetricComponent } from '../metric/metric.component';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MetricData } from 'src/app/model/metric';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { AdminService } from 'src/app/services/admin.service';
import { MetricService } from 'src/app/services/metric.service';
import { Types } from 'src/app/model/path-route';

@Component({
  selector: 'app-metric-data',
  templateUrl: './metric-data.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    './metric-data.component.css'
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' }))
    ]),
  ],
})
export class MetricDataComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  @Input() data: MetricData[];
  @Input() switcher: string;
  @Input() date: string;
  @Input() parent: MetricComponent;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  dataSource: MatTableDataSource<MetricData>;
  dataColumns = ['switcher', 'component', 'result', 'date'];

  expandedElement: MetricData | null;

  removable: boolean = false;

  totalPages: number;
  page: number = 1;
  pageLoaded: number = 0;
  currentPageSize: number = 0;

  constructor(
    private domainRouteService: DomainRouteService,
    private adminService: AdminService,
    private metricService: MetricService,
    private toastService: ToastService,
    private _modalService: NgbModal
  ) { }

  ngOnInit() {
    this.loadDataSource(this.data);
    this.readPermissionToObject();

    this.pageLoaded = this.data.length;
    this.totalPages = this.date ? this.parent.metrics.statistics.switchers
      //if filtered by date, get the sum of positive and negative results
      .filter(switcher => switcher.switcher === this.parent.switcher)[0].dateTimeStatistics
      .filter(date => date.date == this.date)
      .map(sumResults => sumResults.negative + sumResults.positive)[0] :
      //otherwise, just get the total from the statistics
      this.getTotalStatistics();

    this.currentPageSize = this.pageLoaded;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetSwitcherMetrics(): void {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Metric Reset';
    modalConfirmation.componentInstance.question = `Are you sure you want to reset metrics for ${this.switcher}?`;
    modalConfirmation.result.then((result) => {
      if (result) {
        const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
        this.metricService.resetMetricsForSwitcher(domain.id, this.switcher).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          if (data) {
            this.parent.switcher = null;
            this.dataSource = new MatTableDataSource(null);
            this.toastService.showSuccess(`Metrics reseted with success`);
          }
        }, error => {
          this.toastService.showError(`Unable to reset Metrics`);
          ConsoleLogger.printError(error);
        });
      }
    });
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    
    const data = this.dataSource.data.slice();
    let sortedData = [...data].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'switcher': return this.compare(a.config.key, b.config.key, isAsc);
        case 'component': return this.compare(a.component, b.component, isAsc);
        case 'result': return this.compare(a.result ? 'true' : 'false', b.result ? 'true' : 'false', isAsc);
        case 'date': return this.compare(a.date.toString(), b.date.toString(), isAsc);
        default: return 0;
      }
    });

    this.loadDataSource(sortedData);
  }

  onNextPage(): void {
    this.parent.loadDataMetrics(++this.page, this.parent.environment, this.date, this.date).subscribe(metrics => {
      if (metrics) {
        this.loadDataSource(metrics.data);
        this.pageLoaded += metrics.data.length;
        this.currentPageSize = metrics.data.length;
      }
    }, error => {
      ConsoleLogger.printError(error);
    });
  }

  onPreviousPage(): void {
    this.parent.loadDataMetrics(--this.page, this.parent.environment, this.date, this.date).subscribe(metrics => {
      if (metrics) {
        this.loadDataSource(metrics.data);
        this.pageLoaded -= this.currentPageSize;
        this.currentPageSize = metrics.data.length;
      }
    }, error => {
      ConsoleLogger.printError(error);
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  hasPrevious(): boolean {
    return this.page > 1;
  }

  hasNext(): boolean {
    return this.currentPageSize === 50;
  }

  private getTotalStatistics(): number {
    if (this.parent.metrics.statistics.switchers.length) {
      return this.parent.metrics.statistics.switchers
        .filter(switcher => switcher.switcher === this.parent.switcher)[0].total;
    }
    return 0;
  }

  private readPermissionToObject(): void {
    const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.adminService.readCollabPermission(domain.id, ['DELETE'], 'ADMIN', 'name', domain.name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'DELETE') {
            this.removable = element.result === 'ok';
          }
        });
      }
    });
  }

  private loadDataSource(data: MetricData[]): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (metricData: MetricData, filter: string) => {
      return this.customFilterPredicate(metricData, filter);
    };
  }

  private customFilterPredicate(data: MetricData, filter: string): boolean {
    if (data.config.key.toLowerCase().indexOf(filter) >= 0 ||
      data.component.toLowerCase().indexOf(filter) >= 0 ||
      data.result && 'true'.indexOf(filter) >= 0 ||
      !data.result && 'false'.indexOf(filter) >= 0 ||
      data.date.toString().indexOf(filter) >= 0 ||
      data.reason.toLowerCase().toString().indexOf(filter) >= 0)
      return true;
    return false;
  }
  
}
