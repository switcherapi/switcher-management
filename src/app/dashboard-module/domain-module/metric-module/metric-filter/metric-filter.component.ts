import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EnvironmentService } from 'src/app/dashboard-module/services/environment.service';
import { Types } from '../../model/path-route';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { DomainRouteService } from 'src/app/dashboard-module/services/domain-route.service';
import { Environment } from '../../model/environment';
import { DatePipe } from '@angular/common';
import gql from 'graphql-tag';
import { QueryRef, Apollo } from 'apollo-angular';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';

@Component({
  selector: 'app-metric-filter',
  templateUrl: './metric-filter.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    '../../common/css/create.component.css',
    './metric-filter.component.css'
  ]
})
export class MetricFilterComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  dateGroupPattern: string;

  environmentSelection = new FormControl('');
  switcherKeyFormControl = new FormControl('');
  dateAfterFormControl = new FormControl('');
  dateBeforeFormControl = new FormControl('');

  environments: Environment[];
  switchersKey: string[] = [];
  filteredKeys: Observable<string[]>;
  private query: QueryRef<any>;

  constructor(
    private apollo: Apollo,
    private environmentService: EnvironmentService,
    private domainRouteService: DomainRouteService,
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<MetricFilterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.switcherKeyFormControl.setValue(this.data.switcher || '');
    this.loadEnvironments();
    this.loadKeys();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onCleanFilter(data: any) {
    this.switcherKeyFormControl.setValue("");
    this.onFilter(data);
  }

  onFilter(data: any) {
    if (this.switcherKeyFormControl.value.length) {
      data.switcher = this.switcherKeyFormControl.value;
    } else {
      data.switcher = null;
    }

    data.dateGroupPattern = this.dateGroupPattern;
    data.dateAfter = this.datepipe.transform(this.dateAfterFormControl.value, 'yyyy-MM-dd HH:mm:ss');
    data.dateBefore = this.datepipe.transform(this.dateBeforeFormControl.value, 'yyyy-MM-dd HH:mm:ss');
    data.environment = this.environmentSelection.value;
    
    this.dialogRef.close(data);  
  }

  loadEnvironments() {
    this.environmentService.getEnvironmentsByDomainId(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id)
      .pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.environments = env;
      this.environmentSelection.setValue('default');
    });
  }

  loadKeys() {
    this.query = this.apollo.watchQuery({
      query: this.generateGql(),
      variables: { 
        id: this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id,
        environment: this.environmentSelection.value
      }
    });

    this.query.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(result => {
      if (result) {
        const groupKeys = result.data.domain.group.map(
          group => group.config.map(config => config.key));

        this.switchersKey = ([] as string[]).concat(...groupKeys);
      }
    }, error => {
      ConsoleLogger.printError(error);
    });

    this.filteredKeys = this.switcherKeyFormControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.switchersKey.filter(option => option.toLowerCase().includes(filterValue));
  }

  generateGql(): any {
    return gql`
      query domain($id: String!, $environment: String!) {
        domain(_id: $id, environment: $environment) {
          group {
            config {
              key
            }
          }
        }
      }
  `;
  }
}
