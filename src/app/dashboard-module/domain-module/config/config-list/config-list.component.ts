import { Component, OnInit, OnDestroy, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { Config } from 'protractor';
import { DomainRouteService } from '../../../services/domain-route.service';
import { Types } from '../../model/path-route';
import { environment } from 'src/environments/environment';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from 'src/app/dashboard-module/services/config.service';
import { MatSelect, MatSelectionListChange } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Environment } from '../../model/environment';
import { EnvironmentService } from 'src/app/dashboard-module/services/environment.service';

@Component({
  selector: 'app-config-list',
  templateUrl: './config-list.component.html',
  styleUrls: ['./config-list.component.css']
})
export class ConfigListComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @ViewChildren("envSelectionChange")
  public component: QueryList<MatSelect>
  private envSelectionChange: MatSelect;

  environmentSelection: FormGroup;

  environments: Environment[];
  @Output() environmentSelectionChange: EventEmitter<string> = new EventEmitter();

  configs$: Config[];
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService,
    private domainRouteService : DomainRouteService,
    private environmentService: EnvironmentService,
    private errorHandler: RouterErrorHandler
  ) { }

  ngOnInit() {
    this.loadOperationSelectionComponent();

    this.loading = true;
    this.error = '';
    this.configService.getConfigsByGroup(
      this.domainRouteService.getPathElement(Types.SELECTED_GROUP).id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        
      if (data) {
        this.configs$ = data;
        this.loadEnvironments();
      }
      this.loading = false;
    }, error => {
      this.error = this.errorHandler.doError(error);
      this.loading = false;
    });

    setTimeout(() => {
      if (!this.configs$) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    }, environment.timeout);
  }

  ngAfterViewInit() {
    this.component.changes.subscribe((comps: QueryList<MatSelect>) => {
      this.envSelectionChange = comps.first;
      this.envSelectionChange.selectionChange.subscribe((s: MatSelectionListChange) => {
        this.environmentSelectionChange.emit(s.source._value.toString());
      });
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadEnvironments(): void {
    this.environmentService.getEnvironmentsByDomainId(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id).subscribe(env => {
      this.environments = env;
      this.environmentSelection.get('environmentSelection').setValue(this.setProductionFirst());
      this.environmentSelectionChange.emit(this.setProductionFirst());
    });
  }

  loadOperationSelectionComponent(): void {
    this.environmentSelection = this.fb.group({
      environmentSelection: [null, Validators.required]
    });
  }

  setProductionFirst(): string {
    const defaultEnv = this.environments.find(env => env.name === 'default');

    if (defaultEnv) {
      return defaultEnv.name;
    }

    return this.environments[0].name;
  }

}
