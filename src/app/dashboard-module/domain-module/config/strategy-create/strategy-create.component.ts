import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelectionList } from '@angular/material';
import { ConfigCreateComponent } from '../config-create/config-create.component';
import { StrategyService } from 'src/app/dashboard-module/services/strategy.service';
import { ToastService } from 'src/app/_helpers/toast.service';
import { Strategy } from '../../model/strategy';
import { StrategyReq } from '../../model/strategy_req';

@Component({
  selector: 'app-strategy-create',
  templateUrl: './strategy-create.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    '../../common/css/create.component.css',
    './strategy-create.component.css'
  ]
})
export class StrategyCreateComponent implements OnInit {
  operations: string[] = [];
  strategies = [
    'NETWORK_VALIDATION',
    'VALUE_VALIDATION',
    'TIME_VALIDATION',
    'DATE_VALIDATION'
  ];

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
    Validators.required
  ]);

  valueSelectionFormControl = new FormControl('', [
    Validators.required
  ]);

  @ViewChild(MatSelectionList, { static: true })
  private strategyValueSelection: MatSelectionList;

  constructor(
    public dialogRef: MatDialogRef<ConfigCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private strategyService: StrategyService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    this.loadAvailableStrategies();

    this.elementCreationFormGroup = this.formBuilder.group({
      strategyFormControl: this.strategyFormControl,
      operationFormControl: this.operationFormControl,
      descFormControl: this.descFormControl
    });

    this.strategyFormControl.valueChanges.subscribe(value => {
      this.loadOperations(value);
      this.data.strategy = value;
    })

    this.operationFormControl.valueChanges.subscribe(value => {
      this.data.operation = value;
    })

    this.descFormControl.valueChanges.subscribe(value => {
      this.data.description = value;
    })

    this.loadOperations(this.strategies[0]);
  }

  loadAvailableStrategies(): void {
    const currentStrategies: Strategy[] = this.data.currentStrategies
    currentStrategies.forEach(strategy => {
      this.strategies.splice(this.strategies.indexOf(strategy.strategy), 1);
    })
  }

  loadOperations(strategySelected: string): void {
    this.strategyService.getStrategiesRequirements(strategySelected).subscribe(req => {
      this.strategyReq = req;
      this.data.values = [];
      this.operations = req.operationsAvailable.operations

      this.valueSelectionFormControl.setValidators([
        Validators.required,
        valueInputValidator(req.operationsAvailable.validator)
      ]);
    });
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

  addValue(newValue: string) {
    const { valid } = this.valueSelectionFormControl;
    if (valid) {
      this.data.values.push(newValue);
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

}

function valueInputValidator(format: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value.match(format)) {
      return [control.value]
    }
    return null;
  };
}
