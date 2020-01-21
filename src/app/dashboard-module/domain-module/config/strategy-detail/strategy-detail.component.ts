import { Component, OnInit, Input, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { Strategy } from '../../model/strategy';
import { MatSelectionList, MatSelectionListChange } from '@angular/material';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { StrategyService } from 'src/app/dashboard-module/services/strategy.service';
import { AdminService } from 'src/app/dashboard-module/services/admin.service';
import { DetailComponent } from '../../common/detail-component';
import { EnvironmentConfigComponent } from '../../environment-config/environment-config.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastService } from 'src/app/_helpers/toast.service';

@Component({
  selector: 'app-strategy-detail',
  templateUrl: './strategy-detail.component.html',
  styleUrls: ['./strategy-detail.component.css']
})
export class StrategyDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  
  @Input() strategy: Strategy;

  @ViewChild(MatSelectionList, { static: true })
  private strategyValueSelection: MatSelectionList;

  @ViewChild('envSelectionChange', { static: true })
  private envSelectionChange: EnvironmentConfigComponent;

  @ViewChild('descElement', { static: true }) 
  descElement: ElementRef;

  classStatus: string;

  operationCategory: FormGroup;
  valueSelection: FormGroup;

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
      this.valueSelection.get('valueSelection').setValue(s.source.selectedOptions.selected[0].value);
    });
  }

  loadOperationSelectionComponent(): void {
    this.operationCategory = this.fb.group({
      operationCategory: [null, Validators.required]
    });
    
    let toSelect = this.strategyOperations.find(operation => operation === this.strategy.operation);
    this.operationCategory.get('operationCategory').setValue(toSelect);

    this.valueSelection = this.fb.group({
      valueSelection: [null, Validators.required]
    });
  }

  loadStrategyRequirements(): void {
    this.strategyService.getStrategiesRequirements(this.strategy.strategy).subscribe(req => {
      this.strategyOperations = this.strategyService.getAvailableOperations(this.strategy, req);
      this.operationCategory.get('operationCategory').setValue(this.strategy.operation);
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
      this.classStatus = 'header editing';
      this.editing = true;
    } else {
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
      
      const body = {
        operation: this.operationCategory.get('operationCategory').value,
        description: this.descElement.nativeElement.value
      };

      this.strategyService.updateStrategy(this.strategy.id, body.description, body.operation).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.toastService.showSucess(`Strategy updated with success`);
          this.strategy = data;
          this.editing = false;
        }
      }, error => {
        this.toastService.showError(`Unable to update '${this.strategy.strategy}' strategy`);
        this.editing = false;
      });
    }
  }
}
