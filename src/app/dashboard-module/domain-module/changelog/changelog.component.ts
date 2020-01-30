import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { DomainRouteService } from '../../services/domain-route.service';
import { Subject } from 'rxjs';
import { Types, PathRoute } from '../model/path-route';
import { DomainService } from '../../services/domain.service';
import { takeUntil } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { History } from '../model/history';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { ToastService } from 'src/app/_helpers/toast.service';
import { GroupService } from '../../services/group.service';
import { ConfigService } from '../../services/config.service';
import { StrategyService } from '../../services/strategy.service';
import { Strategy } from '../model/strategy';

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' }))
    ]),
  ],
})
export class ChangelogComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @Input() strategy: Strategy;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  
  dataSource: MatTableDataSource<History>;;
  dataColumns = ['newValue', 'date', 'updatedBy'];
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

  constructor(
    private domainRouteService: DomainRouteService,
    private domainService: DomainService,
    private groupService: GroupService,
    private configService: ConfigService,
    private strategyService: StrategyService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadChangeLog();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadChangeLog(): void {
    const currentPathRoute = this.domainRouteService.getPathElement(Types.CURRENT_ROUTE);

    if (currentPathRoute.type === Types.DOMAIN_TYPE) {
      this.loadDomainHistory(currentPathRoute);
    } else if (currentPathRoute.type === Types.GROUP_TYPE) {
      this.loadGroupHistory(currentPathRoute);
    } else if (this.strategy) {
      this.loadStrategyHistory(this.strategy);
    } else if (currentPathRoute.type === Types.CONFIG_TYPE) {
      this.loadConfigHistory(currentPathRoute);
    }
  }

  loadDomainHistory(pathRouteSelection: PathRoute): void {
    this.domainService.getHistory(pathRouteSelection.id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.loadDataSource(data);
      }
    }, error => {
      console.log(error);
      this.toastService.showError(`Unable to load Domain Change Log`);
    });
  }

  loadGroupHistory(pathRouteSelection: PathRoute): void {
    this.groupService.getHistory(pathRouteSelection.id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.loadDataSource(data);
      }
    }, error => {
      console.log(error);
      this.toastService.showError(`Unable to load Group Change Log`);
    });
  }

  loadConfigHistory(pathRouteSelection: PathRoute): void {
    this.configService.getHistory(pathRouteSelection.id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.loadDataSource(data);
      }
    }, error => {
      console.log(error);
      this.toastService.showError(`Unable to load Switcher Change Log`);
    });
  }

  loadStrategyHistory(selectedStrategy: Strategy): void {
    this.strategyService.getHistory(selectedStrategy.id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.loadDataSource(data);
      }
    }, error => {
      console.log(error);
      this.toastService.showError(`Unable to load Strategy Change Log`);
    });
  }

  loadDataSource(data: History[]): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (data: History, filter: string) => {
      return this.customFilterPredicate(data, filter);
    };
  }

  customFilterPredicate(data: History, filter: string): boolean {
    if (data.updatedBy.indexOf(filter) >= 0) {
      return true;
    } else if (data.date.toString().indexOf(filter) >= 0) {
      return true;
    } else {
      return Object.keys(data.newValue).filter(key => key.indexOf(filter) >= 0).length > 0;
    }
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
      const data: Map<string, any> = element;


      return element != undefined ? JSON.stringify(element) : '';
    }
    return element;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
