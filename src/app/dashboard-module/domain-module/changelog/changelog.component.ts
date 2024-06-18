import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Strategy } from 'src/app/model/strategy';
import { History } from 'src/app/model/history';
import { AdminService } from 'src/app/services/admin.service';
import { DomainService } from 'src/app/services/domain.service';
import { GroupService } from 'src/app/services/group.service';
import { ConfigService } from 'src/app/services/config.service';
import { StrategyService } from 'src/app/services/strategy.service';
import { ActivatedRoute } from '@angular/router';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: [
    '../common/css/detail.component.css',
    './changelog.component.css'
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', [
        animate('.1s')
      ]),
    ]),
  ],
})
export class ChangelogComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @Input() domainId: string;
  @Input() domainName: string;
  @Input() strategy: Strategy;
  removable: boolean = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  
  dataSource: MatTableDataSource<History>;
  dataColumns = ['newValue', 'date', 'updatedBy'];
  pageLimit = 11;
  pageLength = 11;
  pageSkip = 0;
  pageFetch = true;
  columnsToDisplay = [
    {
      data: 'newValue',
      display: 'Change'
    },
    {
      data: 'date',
      display: 'Date'
    },
    {
      data: 'updatedBy',
      display: 'Updated By'
    }
  ];
  expandedElement: History | null;

  configId: string;
  groupId: string;
  classStatus = "mat-elevation-z8 loading";
  loading = true;
  fetch = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private domainRouteService: DomainRouteService,
    private adminService: AdminService,
    private domainService: DomainService,
    private groupService: GroupService,
    private configService: ConfigService,
    private strategyService: StrategyService,
    private toastService: ToastService,
    private _modalService: NgbModal,
    private datepipe: DatePipe,
    private errorHandler: RouterErrorHandler
  ) { 
    this.activatedRoute.parent?.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });

    this.activatedRoute.params.subscribe(params => {
      this.groupId = params.groupid;
      this.configId = params.configid;
    });

    this.activatedRoute.paramMap
      .pipe(map(() => window.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.fetch = data.navigationId === 1);
  }

  ngOnInit() {
    this.loadChangeLog();
    this.readPermissionToObject();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onPage(event: PageEvent) {
    this.pageSkip = (event.pageSize * (event.pageIndex + 1)) - event.pageSize;
    this.pageSkip = this.pageSkip + (this.pageLength - this.pageSkip);
    
    if (this.pageFetch) {
      this.loadChangeLog();
    }
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['DELETE'], 'ADMIN')
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

  private loadChangeLog(): void {
    this.loading = true;
    this.domainRouteService.updateView('Change Log', 2);

    if (this.strategy) {
      this.loadStrategyHistory();
    } else if (this.configId) {
      this.loadConfigHistory();
    } else if (this.groupId) {
      this.loadGroupHistory();
    } else {
      this.loadDomainHistory();
    }
  }

  private loadDomainHistory(): void {
    this.loading = true;
    this.domainService.getHistory(this.domainId, this.pageLimit, this.pageSkip)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => this.loadSuccess(data),
        error: error => this.loadError(error)
      });

    this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
      `/dashboard/domain/${encodeURIComponent(this.domainName)}/${this.domainId}`);
  }

  private loadGroupHistory(): void {
    this.loading = true;
    this.groupService.getHistory(this.groupId, this.pageLimit, this.pageSkip)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => this.loadSuccess(data),
        error: error => this.loadError(error)
      });

    if (this.fetch) {
      this.groupService.getGroupById(this.groupId)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(data => {
          this.domainRouteService.updatePath(this.groupId, data.name, Types.GROUP_TYPE, 
            `/dashboard/domain/${this.domainName}/${this.domainId}/groups/${this.groupId}`);
      });
    }
  }

  private loadConfigHistory(): void {
    this.loading = true;
    this.configService.getHistory(this.configId, this.pageLimit, this.pageSkip)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => this.loadSuccess(data),
        error: error => this.loadError(error)
      });

    if (this.fetch) {
      this.configService.getConfigById(this.configId, false)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(data => {
          this.domainRouteService.updatePath(this.configId, data.key, Types.CONFIG_TYPE, 
            `/dashboard/domain/${this.domainName}/${this.domainId}/groups/${this.groupId}/switchers/${this.configId}`);
      });
    }
  }

  private loadStrategyHistory(): void {
    this.loading = true;
    this.strategyService.getHistory(this.strategy.id, this.pageLimit, this.pageSkip)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => this.loadSuccess(data),
        error: error => this.loadError(error)
      });
  }

  private loadDataSource(data: History[], refresh: boolean): void {
    if (this.dataSource && refresh) {
      data = this.dataSource.data.concat(data);
      this.pageLength = data.length;
    }
      
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (dataHistory: History, filter: string) => {
      return this.customFilterPredicate(dataHistory, filter);
    };
  }

  private resetDomainChangeLog(): void {
    this.domainService.resetHistory(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => this.changeLogSuccess(data),
        error: error => this.changeLogError(error)
      });
  }

  private resetGroupChangeLog(): void {
    this.groupService.resetHistory(this.groupId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => this.changeLogSuccess(data),
        error: error => this.changeLogError(error)
      });
  }

  private resetConfigChangeLog(): void {
    this.configService.resetHistory(this.configId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => this.changeLogSuccess(data),
        error: error => this.changeLogError(error)
      });
  }

  private resetStrategyChangeLog(): void {
    this.strategyService.resetHistory(this.strategy.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => this.changeLogSuccess(data),
        error: error => this.changeLogError(error)
      });
  }

  private changeLogSuccess(data: any): void {
    if (data) {
      this.dataSource = new MatTableDataSource(null);
      this.pageLength = 0;
      this.toastService.showSuccess(`Change Log reseted with success`);
    }
  }

  private changeLogError(error: any): void {
    this.toastService.showError(`Unable to reset the Change Log`);
        ConsoleLogger.printError(error);
  }

  private loadSuccess(data: History[]): void {
    if (data?.length) {
      this.loadDataSource(data, true);
    } else {
      this.pageFetch = false;
    }

    this.loading = false;
    this.classStatus = "mat-elevation-z8 ready";
  }

  private loadError(error: any): void {
    ConsoleLogger.printError(error);
    this.errorHandler.doError(error);
    this.loading = false;
  }

  private customFilterPredicate(data: History, filter: string): boolean {
    if (data.updatedBy.indexOf(filter) >= 0) {
      return true;
    }
    
    if (data.date.toString().indexOf(filter) >= 0) {
      return true;
    }

    return Object.keys(data.newValue).filter(key => key.indexOf(filter) >= 0).length > 0 ||
      Object.values(data.newValue).filter(value => value.indexOf(filter) >= 0).length > 0 ||
      Object.values(data.oldValue).filter(value => value.indexOf(filter) >= 0).length > 0;
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data.slice();
    
    if (!sort.active || sort.direction === '') {
      return;
    }

    let sortedData = [...data].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'newValue': return this.compare(this.formatResumedData(a.newValue), this.formatResumedData(b.newValue), isAsc);
        case 'date': return this.compare(a.date.toString(), b.date.toString(), isAsc);
        case 'updateBy': return this.compare(a.updatedBy, b.updatedBy, isAsc);
        default: return 0;
      }
    });
    
    this.loadDataSource(sortedData, false);
  }

  getColumnLabel(dataColumn: string): string {
    return this.columnsToDisplay.filter(column => column.data === dataColumn)[0].display;
  }

  getElementKeys(element: any): string[] {
    return Object.keys(element);
  }

  getElementValue(key: string, element: any): string {
    return element[`${key}`] ? JSON.stringify(element[`${key}`]) : ' ';
  }

  formatResumedData(element: any): string {
    if (element instanceof Object) {
      const data: Map<string, any> = element;
      return Object.keys(data).join(' / ');
    }
    return element;
  }

  formatExpandedData(element: any): string {
    if (element instanceof Object) {
      return element != undefined ? JSON.stringify(element) : '';
    }
    return element;
  }

  formatDateContent(value: string): string {
    if (window.screen.width < 380) {
      return this.datepipe.transform(value, 'yy/MM/dd HH:mm');
    }
    return value;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetHistory() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Change Log Reset';
    modalConfirmation.componentInstance.question = 'Are you sure you want to reset the change log?';
    modalConfirmation.result.then((result) => {
      if (result) {
        if (this.strategy) {
          this.resetStrategyChangeLog();
        } else if (this.configId) {
          this.resetConfigChangeLog();
        } else if (this.groupId) {
          this.resetGroupChangeLog();
        } else {
          this.resetDomainChangeLog();
        }
      }
    });
  }

}
