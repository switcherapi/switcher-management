import { Component, OnInit, Input, ViewChild, OnDestroy, ElementRef, HostListener, inject } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { DetailComponent } from '../../common/detail-component';
import { EnvironmentChangeEvent } from '../../environment-config/environment-config.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastService } from 'src/app/_helpers/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { StrategyListComponent } from '../strategy-list/strategy-list.component';
import { StrategyCloneComponent } from '../strategy-clone/strategy-clone.component';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Strategy } from 'src/app/model/strategy';
import { StrategyReq } from 'src/app/model/strategy_req';
import { StrategyService } from 'src/app/services/strategy.service';
import { AdminService } from 'src/app/services/admin.service';
import { DataUtils } from 'src/app/_helpers/data-utils';

@Component({
  selector: 'app-strategy-detail',
  templateUrl: './strategy-detail.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    './strategy-detail.component.css'
  ],
  standalone: false
})
export class StrategyDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private readonly strategyService = inject(StrategyService);
  private readonly adminService = inject(AdminService);
  private readonly toastService = inject(ToastService);
  private readonly _modalService = inject(NgbModal);
  private readonly dialog = inject(MatDialog);

  private readonly unsubscribe = new Subject<void>();

  @Input() strategy: Strategy;
  @Input() strategyList: StrategyListComponent;

  private strategyReq: StrategyReq;

  @ViewChild(MatSelectionList, { static: true })
  private readonly strategyValueSelection: MatSelectionList;

  @ViewChild('descElement', { static: true })
  descElement: ElementRef;

  envEnable = new Subject<boolean>();

  valueSelectionFormControl = new FormControl('');
  operationCategoryFormControl = new FormControl('');

  strategyFormatSelected: string;
  strategyOperations: string[] = [];
  strategyValuesLength: number;

  constructor() {
    super();
    this.onResize();
  }

  ngOnInit() {
    if (this.strategy.values) {
      this.loadStrategySelectionComponent();
      this.loadOperationSelectionComponent();
      this.loadStrategyRequirements();
    }
    
    this.readPermissionToObject();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  @HostListener('window:resize')
  onResize() {
    this.strategyValuesLength = 30;
    if (window.innerWidth < 1200 && window.innerWidth > 770) {
      this.strategyValuesLength = 50;
    } else if (window.innerWidth < 770) {
      this.strategyValuesLength = 20;
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
        this.setBlockUI(false);
        this.editing = false;
        return;
      }

      this.editStrategy(body);
    }
  }

  delete() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Strategy removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this strategy?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.setBlockUI(true, 'Removing strategy...');
        this.strategyService.deleteStrategy(this.strategy.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: () => {
              this.strategyList.reloadStrategies(this.strategy);
              this.setBlockUI(false);
              this.toastService.showSuccess(`Strategy removed with success`);

              if (!this.strategyList.strategies.getValue().length)
                this.scrollToElement(document.getElementById('page-container'));
            },
            error: error => {
              this.setBlockUI(false);
              this.toastService.showError(`Unable to remove this strategy`);
              ConsoleLogger.printError(error);
            }
          });
      }
    });
  }

  cloneStrategy(): void {
    const dialogRef = this.dialog.open(StrategyCloneComponent, {
      width: '400px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: { 
        currentEnvironment: this.currentEnvironment,
        domainId: this.strategyList.parent.domainId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.setBlockUI(true, 'Cloning strategy...');
        this.strategyService.getStrategiesByConfig(this.strategy.config, result.environment)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: data => {
              if (data.length) {
                this.toastService.showError(`Strategy already exist in ${result.environment}`);
              } else {
                this.strategyService.createStrategy(
                  this.strategy.config,
                  this.strategy.description,
                  this.strategy.strategy,
                  this.strategy.operation,
                  result.environment,
                  this.strategy.values).subscribe({
                    next: () => this.toastService.showSuccess(`Strategy cloned with success`),
                    error: error => {
                      this.toastService.showError(error.error);
                      ConsoleLogger.printError(error);
                    }
                  });
              }
            },
            error: error => this.updateValueError(error, 'Unable to edit this value'),
            complete: () => this.setBlockUI(false)
          });
      }
    });
  }

  addValue(newValue: string) {
    const { valid } = this.valueSelectionFormControl;
    this.setBlockUI(true, 'Adding new value...');

    if (valid) {
      this.strategyService.addValue(this.strategy.id, newValue)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: data => {
            if (data) {
              this.strategyValueSelection.deselectAll();
              this.updateValueSuccess(data);
            }
          },
          error: error => this.updateValueError(error, 'Unable to add this value'),
          complete: () => this.setBlockUI(false)
        });
    } else {
      this.toastService.showError(`Unable to execute this operation`);
    }
  }

  editValue(oldValue: string, newValue: string) {
    const { valid } = this.valueSelectionFormControl;
    if (valid) {
      this.setBlockUI(true, 'Updating value...');
      this.strategyService.updateValue(this.strategy.id, oldValue, newValue)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: data => this.updateValueSuccess(data),
          error: error => this.updateValueError(error, 'Unable to edit this value'),
          complete: () => this.setBlockUI(false)
        });
    } else {
      this.toastService.showError(`Unable to execute this operation`);
    }
  }

  removeValue(value: string) {
    if (this.strategyValueSelection.options.length > 1) {
      this.setBlockUI(true, 'Removing value...');
      this.strategyService.deleteValue(this.strategy.id, value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: data => this.updateValueSuccess(data),
          error: error => this.updateValueError(error, 'Unable to remove this value'),
          complete: () => this.setBlockUI(false)
        });
    } else {
      this.toastService.showError(`One value is required, update or add new values`);
    }
  }

  showChangeLog() {
    this.dialog.open(ChangeLogDialogComponent, {
      width: '1200px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: {
        strategy: this.strategy,
        domainId: this.strategyList.parent.domainId,
        domainName: this.strategyList.parent.domainName
      }
    });
  }

  private updateValueSuccess(data: Strategy) {
    if (data) {
      this.strategy.values = data.values;

      this.strategyList.updateStrategies(data);
      this.loadStrategyRequirements();
      this.toastService.showSuccess(`Strategy updated with success`);
    }
  }

  private updateValueError(error: any, message: string) {
    this.setBlockUI(false);
    this.toastService.showError(error ? error.error : message);
    ConsoleLogger.printError(error);
  }

  private loadStrategySelectionComponent(): void {
    this.strategyValueSelection.selectionChange
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((s: MatSelectionListChange) => {
        this.strategyValueSelection.deselectAll();
        s.options[0].selected = true;
        this.valueSelectionFormControl.setValue(s.source.selectedOptions.selected[0].value);
    });
  }

  private loadOperationSelectionComponent(): void {
    const toSelect = this.strategyOperations.find(operation => operation === this.strategy.operation);
    this.operationCategoryFormControl.setValue(toSelect);
  }

  private loadStrategyRequirements(): void {
    this.strategyService.getStrategiesRequirements(this.strategy.strategy)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(req => {
        this.strategyReq = req;
        this.strategyOperations = this.strategyService.getAvailableOperations(this.strategy, req);
        this.operationCategoryFormControl.setValue(this.strategy.operation);
        this.strategyFormatSelected = req.operationsAvailable.format;

        this.valueSelectionFormControl.setValidators([
          Validators.required,
          DataUtils.valueInputValidator(this.strategyReq.operationsAvailable.validator)
        ]);
    });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.strategyList.parent.domainId, ['CREATE', 'UPDATE', 'UPDATE_ENV_STATUS', 'DELETE'], 
      'STRATEGY', 'strategy', this.strategy.strategy, Object.keys(this.strategy.activated)[0])
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data.length) {
            this.updatable = data.find(permission => permission.action === 'UPDATE').result === 'ok';
            this.removable = data.find(permission => permission.action === 'DELETE').result === 'ok';
            this.creatable = data.find(permission => permission.action === 'CREATE').result === 'ok';
            this.envEnable.next(
              data.find(permission => permission.action === 'UPDATE_ENV_STATUS').result === 'nok' &&
              data.find(permission => permission.action === 'UPDATE').result === 'nok'
            );
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
        },
        complete: () => {
          this.setBlockUI(false);
          this.detailBodyStyle = 'detail-body ready';
        }
      });
  }

  private editStrategy(body: { operation: string; description: any; }) {
    this.strategyService.updateStrategy(this.strategy.id, body.description, body.operation)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.strategy.operation = body.operation;
            this.strategy.description = body.description;
  
            this.toastService.showSuccess(`Strategy updated with success`);
            this.editing = false;
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to update '${this.strategy.strategy}' strategy`);
          this.editing = false;
        }
      });
  }

  public updateEnvironmentStatus(env: EnvironmentChangeEvent): void {
    this.setBlockUI(true, 'Updating environment...');
    this.selectEnvironment(env);
    this.strategyService.setStrategyEnvironmentStatus(this.strategy.id, env.environmentName, env.status)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.toastService.showSuccess(`Environment updated with success`);
          }
        },
        error: error => {
          this.setBlockUI(false);
          this.toastService.showError(`Unable to update the environment '${env.environmentName}'`);
          ConsoleLogger.printError(error);
        },
        complete: () => this.setBlockUI(false)
      });
  }
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
  `],
  standalone: false
})
export class ChangeLogDialogComponent {
  dialogRef = inject<MatDialogRef<ChangeLogDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  onClose() {
    this.dialogRef.close();
  }

}