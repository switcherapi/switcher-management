import { Component, OnInit, OnDestroy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { EnvironmentService } from '../../services/environment.service';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Environment } from '../model/environment';
import { MatSelectionListChange, MatSelect, MatSlideToggleChange, MatSlideToggle } from '@angular/material';
import { DomainRouteService } from '../../services/domain-route.service';
import { Types } from '../model/path-route';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-environment-config',
  templateUrl: './environment-config.component.html',
  styleUrls: [
    '../common/css/detail.component.css',
    './environment-config.component.css']
})
export class EnvironmentConfigComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @Input() currentEnvironment: Map<string, boolean>;
  @Input() notSelectableEnvironments: boolean;
  @Output() outputEnvChanged: EventEmitter<boolean> = new EventEmitter();
  @Output() outputStatusChanged: EventEmitter<any> = new EventEmitter();
  @Output() outputEnvRemoved: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatSelect, { static: true })
  private envSelectionChange: MatSelect;

  @ViewChild(MatSlideToggle, { static: true })
  private toggleEnv: MatSlideToggle;

  toggleClass: string = 'toggle-style deactivated';

  environmentSelection: FormGroup;
  environmentStatusSelection: FormGroup;
  environments: Environment[];
  selectedEnvStatus: boolean;
  selectedEnvName: string;

  constructor(
    private fb: FormBuilder,
    private environmentService: EnvironmentService,
    private domainRouteService: DomainRouteService
  ) { }

  ngOnInit() {
    this.loadOperationSelectionComponent();
    this.loadEnvironments();

    if (this.envSelectionChange) {
      this.envSelectionChange.selectionChange.subscribe((s: MatSelectionListChange) => {
        this.selectedEnvName = s.source._value.toString();

        const currentEnv = this.currentEnvironment[this.selectedEnvName] === undefined ? 
          this.currentEnvironment['default'] : this.currentEnvironment[this.selectedEnvName];

        this.selectedEnvStatus = currentEnv;
        this.environmentStatusSelection.get('environmentStatusSelection').setValue(currentEnv);
        this.outputEnvChanged.emit(this.selectedEnvStatus);
      });
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadEnvironments() {
    this.environmentService.getEnvironmentsByDomainId(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id)
      .pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.environments = env;

      if (!this.notSelectableEnvironments)
        this.environmentSelection.get('environmentSelection').setValue(this.setProductionFirst());
      else {
        this.selectedEnvName = Object.keys(this.currentEnvironment)[0];
        this.environmentSelection.get('environmentSelection').setValue(this.selectedEnvName);
      }


      this.selectedEnvStatus = this.currentEnvironment[this.environmentSelection.get('environmentSelection').value];
      this.outputEnvChanged.emit(this.selectedEnvStatus);
    });
  }

  loadOperationSelectionComponent(): void {
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

  setProductionFirst(): string {
    const env = JSON.parse(JSON.stringify(this.currentEnvironment));
    var keys = Object.keys(env);
    let defaultEnv: Environment;
    for (var i = 0; i < keys.length; i++) {
      defaultEnv = this.environments.find(env => env.name === 'default' || env.name === keys[i]);
      break;
    }

    if (defaultEnv) {
      this.selectedEnvName = defaultEnv.name
      return defaultEnv.name;
    }

    this.selectedEnvName = this.environments[0].name; 
    return this.environments[0].name;
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
    this.currentEnvironment[this.environmentSelection.get('environmentSelection').value] = event.checked;
    const envChanged = {
      environment: this.environmentSelection.get('environmentSelection').value,
      status: event.checked
    }
    this.outputStatusChanged.emit(envChanged);
  }

  removeEnvironment() {
    this.outputEnvRemoved.emit(this.selectedEnvName);
    this.loadEnvironments();
  }

  isDisableToRemove(): boolean {
    if (this.selectedEnvName === 'default')
      return true;
   
    if (this.notSelectableEnvironments)
      return true;

    if (this.currentEnvironment[this.selectedEnvName] === undefined)
      return true;
    
    return false;
  }

}
