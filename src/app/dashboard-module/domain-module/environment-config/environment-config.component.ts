import { Component, OnInit, OnDestroy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSelectionListChange } from '@angular/material/list';
import { Environment } from 'src/app/model/environment';
import { EnvironmentService } from 'src/app/services/environment.service';

@Component({
  selector: 'app-environment-config',
  templateUrl: './environment-config.component.html',
  styleUrls: [
    '../common/css/detail.component.css',
    './environment-config.component.css']
})
export class EnvironmentConfigComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject<void>();

  @Input() domainId: string;
  @Input() selectedEnvName: string;
  @Input() configuredEnvironments: Map<string, boolean>;
  @Input() notSelectableEnvironments: boolean;
  @Input() enable: Subject<boolean>;
  @Output() outputEnvChanged = new EventEmitter<EnvironmentChangeEvent>();
  @Output() outputStatusChanged = new EventEmitter<any>();
  @Output() outputEnvRemoved = new EventEmitter<any>();
  @Output() outputEnvLoaded = new EventEmitter<Environment[]>();

  @ViewChild(MatSelect, { static: true })
  private envSelectionChange: MatSelect;

  @ViewChild(MatSlideToggle, { static: true })
  private toggleEnv: MatSlideToggle;

  toggleClass = 'toggle-style deactivated';

  environmentSelection: FormGroup;
  environmentStatusSelection: FormGroup;
  environments: Environment[];
  selectedEnvStatus: boolean;

  constructor(
    private fb: FormBuilder,
    private environmentService: EnvironmentService
  ) { }

  ngOnInit() {
    this.loadOperationSelectionComponent();
    this.loadEnvironments();

    if (this.envSelectionChange) {
      this.enable?.pipe(takeUntil(this.unsubscribe)).subscribe(req => this.disableEnvChange(req));
      this.envSelectionChange.selectionChange.subscribe((s: MatSelectionListChange) => {
        this.selectedEnvName = s.source._value.toString();

        const currentEnv = this.configuredEnvironments[this.selectedEnvName] === undefined ? 
          this.configuredEnvironments['default'] : this.configuredEnvironments[this.selectedEnvName];

        this.selectedEnvStatus = currentEnv;
        this.environmentStatusSelection.get('environmentStatusSelection').setValue(currentEnv);
        this.outputEnvChanged.emit(new EnvironmentChangeEvent(this.selectedEnvName, this.selectedEnvStatus, true));
      });
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  disableEnvChange(disable: boolean): void {
    this.toggleEnv.disabled = disable;
    if (disable) {
      this.toggleClass = 'toggle-style deactivated';
    } else {
      this.toggleClass = 'toggle-style';
    }
  }

  changeStatus(event: MatSlideToggleChange) {
    this.configuredEnvironments[this.environmentSelection.get('environmentSelection').value] = event.checked;
    this.outputStatusChanged.emit(
      new EnvironmentChangeEvent(this.environmentSelection.get('environmentSelection').value, event.checked));
  }

  removeEnvironment() {
    delete this.configuredEnvironments[this.environmentSelection.get('environmentSelection').value];
    this.outputEnvRemoved.emit(this.selectedEnvName);

    // select production
    this.selectedEnvName = 'default';
    this.selectedEnvStatus = this.configuredEnvironments[this.selectedEnvName];
    this.toggleEnv.checked = this.selectedEnvStatus;
    this.environmentSelection.get('environmentSelection').setValue(this.selectedEnvName);
    this.outputEnvChanged.emit(new EnvironmentChangeEvent(this.selectedEnvName, this.selectedEnvStatus, true));
  }

  isDisableToRemove(): boolean {
    if (this.selectedEnvName === 'default')
      return true;
   
    if (this.notSelectableEnvironments)
      return true;

    if (this.configuredEnvironments[this.selectedEnvName] === undefined)
      return true;
    
    return false;
  }
  
  private loadEnvironments() {
    this.environmentService.getEnvironmentsByDomainId(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(env => {
        this.environments = env;
        this.outputEnvLoaded.emit(env);

        if (!this.notSelectableEnvironments)
          this.environmentSelection.get('environmentSelection').setValue(this.setProductionFirst());
        else {
          this.selectedEnvName = this.selectedEnvName || Object.keys(this.configuredEnvironments)[0];
          this.environmentSelection.get('environmentSelection').setValue(this.selectedEnvName);
        }

        this.selectedEnvStatus = this.configuredEnvironments[this.environmentSelection.get('environmentSelection').value];
        this.outputEnvChanged.emit(new EnvironmentChangeEvent(this.selectedEnvName, this.selectedEnvStatus));
    });
  }

  private loadOperationSelectionComponent(): void {
    this.environmentSelection = this.fb.group({
      environmentSelection: [null, Validators.required]
    });

    if (this.notSelectableEnvironments) {
      this.environmentSelection.get('environmentSelection').disable({ onlySelf: true});
    }

    this.environmentStatusSelection = this.fb.group({
      environmentStatusSelection: [null, Validators.required]
    });
  }

  private setProductionFirst(): string {
    const env = JSON.parse(JSON.stringify(this.configuredEnvironments));
    const keys = Object.keys(env);
    let defaultEnv: Environment;
    
    for (const key of keys) {
      defaultEnv = this.environments.find(e => e.name === 'default' || env.name === key);
      break;
    }

    if (defaultEnv) {
      this.selectedEnvName = defaultEnv.name
      return defaultEnv.name;
    }

    this.selectedEnvName = this.environments[0].name; 
    return this.environments[0].name;
  }

}

export class EnvironmentChangeEvent {
  environmentName: string;
  status?: boolean; // only used by Detail components
  reloadPermissions: boolean;

  constructor(environmentName: string, status?: boolean, reloadPermissions = false) {
    this.environmentName = environmentName;
    this.status = status;
    this.reloadPermissions = reloadPermissions;
  }
}
