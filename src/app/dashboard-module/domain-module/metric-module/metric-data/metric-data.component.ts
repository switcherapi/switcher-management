import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { MetricData } from '../../model/metric';
import { Subject } from 'rxjs';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { trigger, state, style } from '@angular/animations';

@Component({
  selector: 'app-metric-data',
  templateUrl: './metric-data.component.html',
  styleUrls: ['./metric-data.component.css'],
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

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  dataSource: MatTableDataSource<MetricData>;
  dataColumns = ['switcher', 'component', 'result', 'date'];

  expandedElement: MetricData | null;

  constructor() { }

  ngOnInit() {
    this.loadDataSource(this.data);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadDataSource(data: MetricData[]): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (data: MetricData, filter: string) => {
      return this.customFilterPredicate(data, filter);
    };
  }

  customFilterPredicate(data: MetricData, filter: string): boolean {
    if (data.config.key.toLowerCase().indexOf(filter) >= 0) {
      return true;
    } else if (data.component.toLowerCase().indexOf(filter) >= 0) {
      return true;
    } else if (data.result && 'true'.indexOf(filter) >= 0) {
      return true;
    } else if (!data.result && 'false'.indexOf(filter) >= 0) {
      return true;
    } else if (data.date.toString().indexOf(filter) >= 0) {
      return true;
    }

    return false;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
}
