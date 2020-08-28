import { Component, OnInit, OnDestroy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSelectionListChange } from '@angular/material/list';
import { Environment } from 'src/app/model/environment';
import { EnvironmentService } from 'src/app/services/environment.service';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';

@Component({
  selector: 'app-environment-config',
  templateUrl: './environment-config.component.html',
  styleUrls: [
    '../common/css/detail.component.css',
    './environment-config.component.css']
})
export class EnvironmentConfigComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @Input() selectedEnvName: string;
  @Input() configuredEnvironments: Map<string, boolean>;
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

        const currentEnv = this.configuredEnvironments[this.selectedEnvName] === undefined ? 
          this.configuredEnvironments['default'] : this.configuredEnvironments[this.selectedEnvName];

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
        this.selectedEnvName = this.selectedEnvName || Object.keys(this.configuredEnvironments)[0];
        this.environmentSelection.get('environmentSelection').setValue(this.selectedEnvName);
      }


      this.selectedEnvStatus = this.configuredEnvironments[this.environmentSelection.get('environmentSelection').value];
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
    const env = JSON.parse(JSON.stringify(this.configuredEnvironments));
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
    this.configuredEnvironments[this.environmentSelection.get('environmentSelection').value] = event.checked;
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

    if (this.configuredEnvironments[this.selectedEnvName] === undefined)
      return true;
    
    return false;
  }

}
