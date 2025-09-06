import { Component, OnInit, Input, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MetricComponent } from '../metric/metric.component';
import { MatSort, Sort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MetricData } from 'src/app/model/metric';
import { AdminService } from 'src/app/services/admin.service';
import { MetricService } from 'src/app/services/metric.service';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-metric-data',
    templateUrl: './metric-data.component.html',
    styleUrls: [
        '../../common/css/detail.component.css',
        './metric-data.component.css'
    ],
    imports: [MatFormField, MatLabel, MatInput, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, 
      MatSortHeader, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, 
      MatButton, MatMiniFabButton, MatIcon
    ]
})
export class MetricDataComponent implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private readonly metricService = inject(MetricService);
  private readonly toastService = inject(ToastService);
  private readonly _modalService = inject(NgbModal);

  private readonly unsubscribe = new Subject<void>();
  @Input() data: MetricData[];
  @Input() switcher: string;
  @Input() date: string;
  @Input() parent: MetricComponent;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  dataSource: MatTableDataSource<MetricData>;
  dataColumns = ['switcher', 'component', 'result', 'date'];

  expandedElement = signal<MetricData | null>(null);

  removable = false;

  totalPages: number;
  page = 1;
  pageLoaded = 0;
  currentPageSize = 0;

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

  toggleExpanded(element: MetricData) {
    const currentExpanded = this.expandedElement();
    if (currentExpanded === element) {
      this.expandedElement.set(null);
    } else {
      this.expandedElement.set(element);
    }
  }

  isExpanded(element: MetricData): boolean {
    return this.expandedElement() === element;
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
        this.metricService.resetMetricsForSwitcher(this.parent.domainId, this.switcher)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: data => {
              if (data) {
                this.dataSource = new MatTableDataSource(null);
                this.toastService.showSuccess(`Metrics reseted with success`);
              }
            },
            error: error => {
              this.toastService.showError(`Unable to reset Metrics`);
              ConsoleLogger.printError(error);
            }
          });
      }
    });
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    
    const data = this.dataSource.data.slice();
    const sortedData = [...data].sort((a, b) => {
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
    this.parent.loadDataMetrics(++this.page, this.parent.environment, this.date, this.date)
      .subscribe({
        next: metrics => {
          if (metrics) {
            this.loadDataSource(metrics.data);
            this.pageLoaded += metrics.data.length;
            this.currentPageSize = metrics.data.length;
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
        }
      });
  }

  onPreviousPage(): void {
    this.parent.loadDataMetrics(--this.page, this.parent.environment, this.date, this.date)
      .subscribe({
        next: metrics => {
          if (metrics) {
            this.loadDataSource(metrics.data);
            this.pageLoaded -= this.currentPageSize;
            this.currentPageSize = metrics.data.length;
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
        }
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
    this.adminService.readCollabPermission(this.parent.domainId, ['DELETE'], 'ADMIN')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
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
    return data.config.key.toLowerCase().indexOf(filter) >= 0 ||
      data.component.toLowerCase().indexOf(filter) >= 0 ||
      data.result && 'true'.indexOf(filter) >= 0 ||
      !data.result && 'false'.indexOf(filter) >= 0 ||
      data.date.toString().indexOf(filter) >= 0 ||
      data.reason.toLowerCase().toString().indexOf(filter) >= 0 ||
      data.message?.toLowerCase().toString().indexOf(filter) >= 0 ||
      data.entry?.filter(e => {
        return e.input.toLowerCase().toString().indexOf(filter) >= 0 ||
          e.strategy.toLowerCase().toString().indexOf(filter) >= 0;
      }).length > 0;
  }
  
}
