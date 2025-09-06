import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { Environment } from 'src/app/model/environment';
import { EnvironmentService } from 'src/app/services/environment.service';
import { OnElementAutocomplete, ElementAutocompleteComponent } from '../../common/element-autocomplete/element-autocomplete.component';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatInput, MatSuffix } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';

@Component({
    selector: 'app-metric-filter',
    templateUrl: './metric-filter.component.html',
    styleUrls: [
        '../../common/css/detail.component.css',
        '../../common/css/create.component.css',
        './metric-filter.component.css'
    ],
    imports: [MatDialogTitle, MatToolbar, MatIconButton, MatIcon, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatSelect, 
      FormsModule, ReactiveFormsModule, MatOption, ElementAutocompleteComponent, MatInput, MatDatepickerInput, 
      MatDatepickerToggle, MatSuffix, MatDatepicker, MatDialogActions, MatButton
    ]
})
export class MetricFilterComponent implements OnInit, OnDestroy, OnElementAutocomplete {
  private readonly environmentService = inject(EnvironmentService);
  private readonly datepipe = inject(DatePipe);
  dialogRef = inject<MatDialogRef<MetricFilterComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  private readonly unsubscribe = new Subject<void>();

  dateGroupPattern: string;

  environmentSelection = new FormControl('');
  dateAfterFormControl = new FormControl('');
  dateBeforeFormControl = new FormControl('');

  environments: Environment[];
  selectedFilter: string;
  selectedFilterType = 'Switcher';
  lockFilter = false;
  domainId: string;

  ngOnInit(): void {
    this.selectedFilter = this.data.filter || '';
    this.lockFilter = this.data.lockFilter || false;
    this.domainId = this.data.domainId;
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
    if (!this.lockFilter) {
      this.selectedFilter = '';
    }
    
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
    return this.domainId;
  }

  private loadEnvironments() {
    this.environmentService.getEnvironmentsByDomainId(this.domainId)
      .pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.environments = env;
      this.environmentSelection.setValue(this.data.environment || 'default');
    });
  }

}
