import { Component, OnInit, Inject, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ConfigCreateComponent } from '../config-create/config-create.component';
import { ToastService } from 'src/app/_helpers/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAX_VALUE_LENGTH, StrategyReq } from 'src/app/model/strategy_req';
import { StrategyService } from 'src/app/services/strategy.service';
import { Strategy } from 'src/app/model/strategy';
import { JsonReader } from 'src/app/_helpers/json-reader';
import { DataUtils } from 'src/app/_helpers/data-utils';

@Component({
  selector: 'app-strategy-create',
  templateUrl: './strategy-create.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    '../../common/css/create.component.css',
    './strategy-create.component.css'
  ]
})
export class StrategyCreateComponent implements OnInit, OnDestroy {
  private readonly unsubscribe = new Subject<void>();

  operations: string[] = [];
  strategies: string[] = [];

  strategyFormatSelected: string;
  strategySelected: string;
  strategyReq: StrategyReq;

  elementCreationFormGroup: FormGroup;

  strategyFormControl = new FormControl('', [
    Validators.required
  ]);

  operationFormControl = new FormControl('', [
    Validators.required
  ]);

  descFormControl = new FormControl('', [
    Validators.maxLength(256)
  ]);

  valueSelectionFormControl = new FormControl('', [
    Validators.required
  ]);

  @ViewChild(MatSelectionList, { static: true })
  private readonly strategyValueSelection: MatSelectionList;

  constructor(
    public dialogRef: MatDialogRef<ConfigCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: FormBuilder,
    private readonly strategyService: StrategyService,
    private readonly toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadStrategies();
    this.loadStrategySelectionComponent();

    this.elementCreationFormGroup = this.formBuilder.group({
      strategyFormControl: this.strategyFormControl,
      operationFormControl: this.operationFormControl,
      descFormControl: this.descFormControl
    });

    this.strategyFormControl.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.loadOperations(value);
      this.data.strategy = value;
    });

    this.operationFormControl.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.data.operation = value;
    });

    this.data.description = '';
    this.descFormControl.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.data.description = value;
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(data: any) {
    const { valid } = this.elementCreationFormGroup;
    const strategyValidation = this.strategyService.validateStrategy(this.data.operation, this.data.values, this.strategyReq);

    if (valid && strategyValidation) {
        this.dialogRef.close(data);
    }      
  }

  addValue(value: string) {
    let { valid } = this.valueSelectionFormControl;
    if (valid && this.data.values) {
      if (JsonReader.isValidJSONString(value)) {
        valid = DataUtils.pushValuesIfValid(this.data.values, 
          JsonReader.payloadReader(JSON.parse(value)), MAX_VALUE_LENGTH);
      } else {
        valid = DataUtils.pushValuesIfValid(this.data.values, [value], MAX_VALUE_LENGTH);
      }

      if (!valid)
        this.toastService.showError(`One or more values are longer than ${MAX_VALUE_LENGTH} characters`);
    } else {
      this.toastService.showError(`Unable to execute this operation`);
    }
  }

  removeValue(value: string) {
    if (this.strategyValueSelection.options.length > 1) {
      this.data.values.splice(this.data.values.indexOf(value), 1);
    } else {
      this.toastService.showError(`One value is required, update or add new values`);
    }
  }

  showResumed(value: string, length: number): string {
    return DataUtils.showResumed(value, length);
  }

  private loadStrategySelectionComponent(): void {
    this.strategyValueSelection.selectionChange.pipe(takeUntil(this.unsubscribe)).subscribe((s: MatSelectionListChange) => {
      this.strategyValueSelection.deselectAll();
      s.options[0].selected = true;
      this.valueSelectionFormControl.setValue(s.source.selectedOptions.selected[0].value);
    });
  }

  private loadAvailableStrategies(): void {
    const currentStrategies: Strategy[] = this.data.currentStrategies
    currentStrategies.forEach(strategy => {
      this.strategies.splice(this.strategies.indexOf(strategy.strategy), 1);
    })
  }

  private loadOperations(strategySelected: string): void {
    this.strategyService.getStrategiesRequirements(strategySelected).pipe(takeUntil(this.unsubscribe)).subscribe(req => {
      this.strategyReq = req;
      this.data.values = [];
      this.operations = req.operationsAvailable.operations;
      this.strategyFormatSelected = req.operationsAvailable.format;

      this.valueSelectionFormControl.setValidators([
        Validators.required,
        DataUtils.valueInputValidator(req.operationsAvailable.validator)
      ]);
    });
  }

  private loadStrategies(): void {
    this.strategyService.getStrategiesAvailable().pipe(takeUntil(this.unsubscribe)).subscribe(req => {
      this.strategies = req.strategiesAvailable;
      this.loadAvailableStrategies();
    });
  }

}