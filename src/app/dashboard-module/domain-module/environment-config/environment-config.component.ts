import { Component, OnInit, OnDestroy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { EnvironmentService } from '../../services/environment.service';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Environment } from '../model/environment';
import { MatSelectionListChange, MatSelect, MatSlideToggleChange } from '@angular/material';
import { DomainRouteService } from '../../services/domain-route.service';
import { Types } from '../model/path-route';

@Component({
  selector: 'app-environment-config',
  templateUrl: './environment-config.component.html',
  styleUrls: ['./environment-config.component.css']
})
export class EnvironmentConfigComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @Input() currentEnvironment: Map<string, boolean>;
  @Output() statusChanged: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(MatSelect, { static: true })
  private envSelectionChange: MatSelect;

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

    this.environmentService.getEnvironmentsByDomainId(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id).subscribe(env => {
      this.environments = env;
      this.environmentSelection.get('environmentSelection').setValue(this.setProductionFirst());
      this.selectedEnvStatus = this.currentEnvironment[this.environmentSelection.get('environmentSelection').value];
      this.statusChanged.emit(this.selectedEnvStatus);
    });

    this.envSelectionChange.selectionChange.subscribe((s: MatSelectionListChange) => {
      this.selectedEnvName = s.source._value.toString();

      const currentEnv = this.currentEnvironment[this.selectedEnvName] === undefined ? 
        this.currentEnvironment['default'] : this.currentEnvironment[this.selectedEnvName];

      this.selectedEnvStatus = currentEnv;
      this.environmentStatusSelection.get('environmentStatusSelection').setValue(currentEnv);
      this.statusChanged.emit(this.selectedEnvStatus);
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadOperationSelectionComponent(): void {
    this.environmentSelection = this.fb.group({
      environmentSelection: [null, Validators.required]
    });

    this.environmentStatusSelection = this.fb.group({
      environmentStatusSelection: [null, Validators.required]
    });
  }

  setProductionFirst(): string {
    const defaultEnv = this.environments.find(env => env.name === 'default');

    if (defaultEnv) {
      return defaultEnv.name;
    }

    return this.environments[0].name;
  }

  changeStatus(event: MatSlideToggleChange) {
    // Invoke API
    // console.log(event.checked);
    // console.log(this.environmentSelection.get('environmentSelection').value);
    this.currentEnvironment[this.environmentSelection.get('environmentSelection').value] = event.checked;
    this.statusChanged.emit(event.checked);
  }

}
