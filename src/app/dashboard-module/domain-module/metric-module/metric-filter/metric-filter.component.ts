import { Component, OnInit, OnDestroy, Inject, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EnvironmentService } from 'src/app/dashboard-module/services/environment.service';
import { Types } from '../../model/path-route';
import { takeUntil } from 'rxjs/operators';
import { DomainRouteService } from 'src/app/dashboard-module/services/domain-route.service';
import { Environment } from '../../model/environment';
import { DatePipe } from '@angular/common';

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

  constructor(
    private environmentService: EnvironmentService,
    private domainRouteService: DomainRouteService,
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<MetricFilterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.switcherKeyFormControl.setValue(this.data.switcher || '');
    this.loadEnvironments();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onFilter(data: any) {
    if (this.switcherKeyFormControl.value.length) {
      data.switcher = this.switcherKeyFormControl.value;
    } else {
      data.switcher = null;
    }

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
}
