import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { Environment } from 'src/app/model/environment';
import { EnvironmentService } from 'src/app/services/environment.service';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';
import { OnElementAutocomplete } from '../../common/element-autocomplete/element-autocomplete.component';

@Component({
  selector: 'app-metric-filter',
  templateUrl: './metric-filter.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    '../../common/css/create.component.css',
    './metric-filter.component.css'
  ]
})
export class MetricFilterComponent implements OnInit, OnDestroy, OnElementAutocomplete {
  private unsubscribe: Subject<void> = new Subject();

  dateGroupPattern: string;

  environmentSelection = new FormControl('');
  dateAfterFormControl = new FormControl('');
  dateBeforeFormControl = new FormControl('');

  environments: Environment[];
  selectedFilter: string;
  selectedFilterType: string = 'Switcher';
  lockFilter: boolean = false;
  selectedDomain: string;

  constructor(
    private environmentService: EnvironmentService,
    private domainRouteService: DomainRouteService,
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<MetricFilterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.selectedFilter = this.data.filter || '';
    this.lockFilter = this.data.lockFilter || false;
    this.selectedDomain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id;
    this.loadEnvironments();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onCleanFilter(data: any) {
    this.selectedFilter = '';
    this.onFilter(data);
  }

  onFilter(data: any) {
    if (this.selectedFilter) {
      data.filter = this.selectedFilter;
      data.filterType = this.selectedFilterType;
    } else {
      data.filter = null;
    }

    data.dateGroupPattern = this.dateGroupPattern;
    data.dateAfter = this.datepipe.transform(this.dateAfterFormControl.value, 'yyyy-MM-dd HH:mm:ss');
    data.dateBefore = this.datepipe.transform(this.dateBeforeFormControl.value, 'yyyy-MM-dd HH:mm:ss');
    data.environment = this.environmentSelection.value;
    
    this.dialogRef.close(data);  
  }

  onSelectElementFilter(value: any): void {
    this.selectedFilter = value.name;
    this.selectedFilterType = value.type;
  }

  getDomainId(): string {
    return this.selectedDomain;
  }

  loadEnvironments() {
    this.environmentService.getEnvironmentsByDomainId(this.selectedDomain)
      .pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.environments = env;
      this.environmentSelection.setValue(this.data.environment || 'default');
    });
  }

}
