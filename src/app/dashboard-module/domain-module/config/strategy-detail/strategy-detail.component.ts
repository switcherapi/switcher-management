import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { Strategy } from '../../model/strategy';
import { MatSelectionList, MatSelectionListChange } from '@angular/material';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { StrategyService } from 'src/app/dashboard-module/services/strategy.service';
import { AdminService } from 'src/app/dashboard-module/services/admin.service';
import { DetailComponent } from '../../common/detail-component';
import { EnvironmentConfigComponent } from '../../environment-config/environment-config.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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

  classStatus: string;

  operationCategory: FormGroup;
  valueSelection: FormGroup;

  strategyOperations: string[] = [];

  constructor(
    private fb: FormBuilder,
    private strategyService: StrategyService,
    private adminService: AdminService
    ) {
      super(adminService);
     }

  ngOnInit() {
    this.loadStrategySelectionComponent();
    this.loadOperationSelectionComponent();
    this.loadStrategyRequirements();

    this.envSelectionChange.statusChanged.pipe(takeUntil(this.unsubscribe)).subscribe(status => {
      this.updateStatus(status);
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
      this.strategyOperations = req.operationsAvailable.operations;
      this.operationCategory.get('operationCategory').setValue(this.strategy.operation);
    });
  }

  updateStatus(status: boolean): void {
    this.currentStatus = status;

    if (this.editing) {
      this.classStatus = 'header editing';
    } else {
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
    }
  }

  edit() {
    this.editing = !this.editing;

    if (this.editing) {
      this.classStatus = 'header editing';
    } else {
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
    }
  }
}
