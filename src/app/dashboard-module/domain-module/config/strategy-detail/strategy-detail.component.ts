import { Component, OnInit, Input, ViewChild, OnDestroy, ElementRef, Inject } from '@angular/core';
import { Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { DetailComponent } from '../../common/detail-component';
import { EnvironmentConfigComponent } from '../../environment-config/environment-config.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastService } from 'src/app/_helpers/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirm } from 'src/app/_helpers/confirmation-dialog';
import { StrategyListComponent } from '../strategy-list/strategy-list.component';
import { StrategyCloneComponent } from '../strategy-clone/strategy-clone.component';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Strategy } from 'src/app/model/strategy';
import { StrategyReq } from 'src/app/model/strategy_req';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { StrategyService } from 'src/app/services/strategy.service';
import { AdminService } from 'src/app/services/admin.service';
import { Types } from 'src/app/model/path-route';

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

  @BlockUI() blockUI: NgBlockUI;

  @Input() strategy: Strategy;
  @Input() strategyList: StrategyListComponent;

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

  strategyFormatSelected: string;
  strategyOperations: string[] = [];

  constructor(
    private domainRouteService: DomainRouteService,
    private strategyService: StrategyService,
    private adminService: AdminService,
    private toastService: ToastService,
    private _modalService: NgbModal,
    private dialog: MatDialog
  ) {
    super(adminService);
  }

  ngOnInit() {
    if (this.strategy.values) {
      this.loadStrategySelectionComponent();
      this.loadOperationSelectionComponent();
      this.loadStrategyRequirements();
    }

    this.envSelectionChange.outputEnvChanged.pipe(takeUntil(this.unsubscribe)).subscribe(status => {
      this.selectEnvironment(status);
    });

    this.envSelectionChange.outputStatusChanged.pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.updateEnvironmentStatus(env);
    });

    super.loadAdmin(this.strategy.owner);
    this.readPermissionToObject();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadStrategySelectionComponent(): void {
    this.strategyValueSelection.selectionChange.pipe(takeUntil(this.unsubscribe)).subscribe((s: MatSelectionListChange) => {
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
    this.strategyService.getStrategiesRequirements(this.strategy.strategy).pipe(takeUntil(this.unsubscribe)).subscribe(req => {
      this.strategyReq = req;
      this.strategyOperations = this.strategyService.getAvailableOperations(this.strategy, req);
      this.operationCategoryFormControl.setValue(this.strategy.operation);
      this.strategyFormatSelected = req.operationsAvailable.format;

      this.valueSelectionFormControl.setValidators([
        Validators.required,
        valueInputValidator(this.strategyReq.operationsAvailable.validator)
      ]);
    });
  }

  readPermissionToObject(): void {
    const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.adminService.readCollabPermission(domain.id, ['UPDATE', 'DELETE'], 'STRATEGY', 'strategy', this.strategy.strategy)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'UPDATE') {
            this.updatable = element.result === 'ok' ? true : false;
            this.envSelectionChange.disableEnvChange(!this.updatable);
          } else if (element.action === 'DELETE') {
            this.removable = element.result === 'ok' ? true : false;
          }
        });
      }
    });
  }

  updateEnvironmentStatus(env: any): void {
    this.blockUI.start('Updating environment...');
    this.selectEnvironment(env.status);
    this.strategyService.setStrategyEnvironmentStatus(this.strategy.id, env.environment, env.status).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.toastService.showSuccess(`Environment updated with success`);
      }
    }, error => {
      this.blockUI.stop();
      this.toastService.showError(`Unable to update the environment '${env.environment}'`);
    }, () => this.blockUI.stop());
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

      if (super.validateEdition(
          { operation: this.strategy.operation, description: this.strategy.description }, 
          { operation: body.operation, description: body.description})) {
        this.blockUI.stop();
        this.editing = false;
        return;
      }

      this.strategyService.updateStrategy(this.strategy.id, body.description, body.operation).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.toastService.showSuccess(`Strategy updated with success`);
          this.strategy = data;
          this.editing = false;
        }
      }, error => {
        ConsoleLogger.printError(error);
        this.toastService.showError(`Unable to update '${this.strategy.strategy}' strategy`);
        this.editing = false;
      });
    }
  }

  delete() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Strategy removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this strategy?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.blockUI.start('Removing strategy...');
        this.strategyService.deleteStrategy(this.strategy.id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          this.strategyList.reloadStrategies(this.strategy);
          this.blockUI.stop();
          this.toastService.showSuccess(`Strategy removed with success`);
        }, error => {
          this.blockUI.stop();
          this.toastService.showError(`Unable to remove this strategy`);
          ConsoleLogger.printError(error);
        });
      }
    });
  }

  cloneStrategy(): void {
    const dialogRef = this.dialog.open(StrategyCloneComponent, {
      width: '400px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: { currentEnvironment: this.envSelectionChange.selectedEnvName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.blockUI.start('Cloning strategy...');
        this.strategyService.getStrategiesByConfig(this.strategy.config, result.environment).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          if (data.length) {
            this.toastService.showError(`Strategy already exist in ${result.environment}`);
          } else {
            this.strategyService.createStrategy(
              this.strategy.config,
              this.strategy.description,
              this.strategy.strategy,
              this.strategy.operation,
              result.environment,
              this.strategy.values).subscribe(data => {
                this.toastService.showSuccess(`Strategy cloned with success`);
              }, error => {
                this.toastService.showError(error.error);
                ConsoleLogger.printError(error);
              });
          }
        }, error => {
          this.blockUI.stop();
          this.toastService.showError(error.error);
          ConsoleLogger.printError(error);
        }, () => this.blockUI.stop());
      }
    });
  }

  addValue(newValue: string) {
    const { valid } = this.valueSelectionFormControl;
    this.blockUI.start('Adding new value...');
    if (valid) {
      this.strategyService.addValue(this.strategy.id, newValue).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.strategyValueSelection.deselectAll();
          this.strategy = data;
          this.loadStrategyRequirements();
          this.toastService.showSuccess(`Strategy updated with success`);
        }
      }, error => {
        this.blockUI.stop();
        this.toastService.showError(error ? error.error : 'Unable to add this value');
      }, () => this.blockUI.stop());
    } else {
      this.toastService.showError(`Unable to execute this operation`);
    }
  }

  editValue(oldValue: string, newValue: string) {
    const { valid } = this.valueSelectionFormControl;
    this.blockUI.start('Updating value...');
    if (valid) {
      this.strategyService.updateValue(this.strategy.id, oldValue, newValue).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.strategy = data;
          this.loadStrategyRequirements();
          this.toastService.showSuccess(`Strategy updated with success`);
        }
      }, error => {
        this.blockUI.stop();
        this.toastService.showError(error ? error.error : 'Unable to edit this value');
      }, () => this.blockUI.stop());
    } else {
      this.toastService.showError(`Unable to execute this operation`);
    }
  }

  removeValue(value: string) {
    if (this.strategyValueSelection.options.length > 1) {
      this.blockUI.start('Removing value...');
      this.strategyService.deleteValue(this.strategy.id, value).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.strategy = data;
          this.loadStrategyRequirements();
          this.toastService.showSuccess(`Strategy updated with success`);
        }
      }, error => {
        this.blockUI.stop();
        this.toastService.showError(error ? error.error : 'Unable to remove this value');
      }, () => this.blockUI.stop());
    } else {
      this.toastService.showError(`One value is required, update or add new values`);
    }
  }

  showChangeLog() {
    this.dialog.open(ChangeLogDialog, {
      width: '1200px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: {
        strategy: this.strategy
      }
    });
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

@Component({
  selector: 'strategy-changelog-dialog',
  templateUrl: 'strategy-changelog-dialog.html',
  styleUrls: [
    '../../common/css/create.component.css'
  ],
  styles: [`
    .btn-cancel {
      float: right;
      margin-right: 10px;
      background: #8e8e8e;
    }
    
    .mat-dialog-content {
      padding-bottom: 20px;
      padding-left: 10px;
      padding-right: 10px;
    }

    .header-log {
      background: linear-gradient(to right, #549bfb 0, #549bfb, #5298ff 10px, #fff 100%) no-repeat;
      color: white;
      padding: 10px;
      border-radius: 20px;
    }
  `]
})
export class ChangeLogDialog {

  constructor(
    public dialogRef: MatDialogRef<ChangeLogDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Strategy) { }

  onClose() {
    this.dialogRef.close();
  }

}