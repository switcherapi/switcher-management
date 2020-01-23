import { Component, OnInit, Input, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { Strategy } from '../../model/strategy';
import { MatSelectionList, MatSelectionListChange } from '@angular/material';
import { FormGroup, Validators, FormBuilder, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { StrategyService } from 'src/app/dashboard-module/services/strategy.service';
import { AdminService } from 'src/app/dashboard-module/services/admin.service';
import { DetailComponent } from '../../common/detail-component';
import { EnvironmentConfigComponent } from '../../environment-config/environment-config.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastService } from 'src/app/_helpers/toast.service';
import { StrategyReq } from '../../model/strategy_req';

@Component({
  selector: 'app-strategy-detail',
  templateUrl: './strategy-detail.component.html',
  styleUrls: [
    '../../common/css/detail.component.css', 
    './strategy-detail.component.css'
  ]
})
export class StrategyDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  
  @Input() strategy: Strategy;
  private strategyReq: StrategyReq;

  @ViewChild(MatSelectionList, { static: true })
  private strategyValueSelection: MatSelectionList;

  @ViewChild('envSelectionChange', { static: true })
  private envSelectionChange: EnvironmentConfigComponent;

  @ViewChild('descElement', { static: true }) 
  descElement: ElementRef;

  classStatus: string;

  valueSelectionFormControl = new FormControl('');
  operationCategoryFormControl = new FormControl('');

  strategyOperations: string[] = [];

  constructor(
    private fb: FormBuilder,
    private strategyService: StrategyService,
    private adminService: AdminService,
    private toastService: ToastService
    ) {
      super(adminService);
     }

  ngOnInit() {
    this.loadStrategySelectionComponent();
    this.loadOperationSelectionComponent();
    this.loadStrategyRequirements();

    this.envSelectionChange.outputEnvChanged.pipe(takeUntil(this.unsubscribe)).subscribe(status => {
      this.selectEnvironment(status);
    });

    this.envSelectionChange.outputStatusChanged.pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.updateEnvironmentStatus(env);
    });

    super.loadAdmin(this.strategy.owner);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadStrategySelectionComponent(): void {
    this.strategyValueSelection.selectionChange.subscribe((s: MatSelectionListChange) => {
      this.strategyValueSelection.deselectAll();
      s.option.selected = true;
      this.valueSelectionFormControl.setValue(s.source.selectedOptions.selected[0].value);
    });
  }

  loadOperationSelectionComponent(): void {
    let toSelect = this.strategyOperations.find(operation => operation === this.strategy.operation);
    this.operationCategoryFormControl.setValue(toSelect);
  }

  loadStrategyRequirements(): void {
    this.strategyService.getStrategiesRequirements(this.strategy.strategy).subscribe(req => {
      this.strategyReq = req;
      this.strategyOperations = this.strategyService.getAvailableOperations(this.strategy, req);
      this.operationCategoryFormControl.setValue(this.strategy.operation);

      this.valueSelectionFormControl.setValidators([
        Validators.required,
        valueInputValidator(this.strategyReq.operationsAvailable.validator)
      ]);
    });
  }

  updateEnvironmentStatus(env : any): void {
    this.selectEnvironment(env.status);
    this.strategyService.setStrategyEnvironmentStatus(this.strategy.id, env.environment, env.status).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.toastService.showSucess(`Environment updated with success`);
      }
    }, error => {
      this.toastService.showError(`Unable to update the environment '${env.environment}'`);
    });
  }

  selectEnvironment(status: boolean): void {
    this.currentStatus = status;

    if (this.editing) {
      this.classStatus = 'header editing';
    } else {
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
    }
  }

  edit() {
    if (!this.editing) {
      this.loadStrategyRequirements();
      this.classStatus = 'header editing';
      this.editing = true;
    } else {
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
      
      const body = {
        operation: this.operationCategoryFormControl.value,
        description: this.descElement.nativeElement.value
      };

      this.strategyService.updateStrategy(this.strategy.id, body.description, body.operation).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.toastService.showSucess(`Strategy updated with success`);
          this.strategy = data;
          this.editing = false;
        }
      }, error => {
        console.log(error)
        this.toastService.showError(`Unable to update '${this.strategy.strategy}' strategy`);
        this.editing = false;
      });
    }
  }

  addValue(newValue: string) {
    const { valid } = this.valueSelectionFormControl;
    if (valid) {
      this.strategyService.addValue(this.strategy.id, newValue).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.strategyValueSelection.deselectAll();
          this.strategy = data;
          this.toastService.showSucess(`Strategy updated with success`);
        }
      }, error => {
        this.toastService.showError(error.error);
      });
    } else {
      this.toastService.showError(`Unable to execute this operation`);
    }
  }

  editValue(oldValue: string, newValue: string) {
    const { valid } = this.valueSelectionFormControl;
    if (valid) {
      this.strategyService.updateValue(this.strategy.id, oldValue, newValue).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.strategy = data;
          this.toastService.showSucess(`Strategy updated with success`);
        }
      }, error => {
        this.toastService.showError(error.error);
      });
    } else {
      this.toastService.showError(`Unable to execute this operation`);
    }
  }

  removeValue(value: string) {
    if (this.strategyValueSelection.options.length > 1) {
      this.strategyService.deleteValue(this.strategy.id, value).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.strategy = data;
          this.toastService.showSucess(`Strategy updated with success`);
        }
      }, error => {
        this.toastService.showError(error.error);
      });
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