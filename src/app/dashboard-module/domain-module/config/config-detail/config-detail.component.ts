import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, takeUntil, startWith } from 'rxjs/operators';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { DetailComponent } from '../../common/detail-component';
import { EnvironmentChangeEvent } from '../../environment-config/environment-config.component';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { StrategyCreateComponent } from '../strategy-create/strategy-create.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatChipInputEvent } from '@angular/material/chips';
import { Strategy } from 'src/app/model/strategy';
import { SwitcherComponent } from 'src/app/model/switcher-component';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';
import { ConfigService } from 'src/app/services/config.service';
import { AdminService } from 'src/app/services/admin.service';
import { StrategyService } from 'src/app/services/strategy.service';
import { ComponentService } from 'src/app/services/component.service';
import { Config, ConfigRelay } from 'src/app/model/config';

@Component({
  selector: 'app-config-detail',
  templateUrl: './config-detail.component.html',
  styleUrls: [
    '../../common/css/detail.component.css', 
    './config-detail.component.css'
  ]
})
export class ConfigDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @BlockUI() blockUI: NgBlockUI;

  @ViewChild('descElement', { static: true }) 
  descElement: ElementRef;

  @ViewChild('keyElement', { static: true }) 
  keyElement: ElementRef;
  
  @ViewChild('componentInput') 
  componentInput: ElementRef<HTMLInputElement>;
  
  @ViewChild('auto') 
  matAutocomplete: MatAutocomplete;

  envEnable = new Subject<boolean>();

  keyFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ]);
  
  classStrategySection: string;
  disableMetrics: boolean;
  
  domainId: string;
  domainName: string;
  groupId: string;
  configId: string;
  config: Config;
  strategies = new BehaviorSubject<Strategy[]>([]);
  strategiesCreatable = false;
  relayUpdatable = false;

  loading = true;
  loadingStrategies = true;
  hasStrategies = false;
  hasNewStrategy = false;
  error = '';

  //tabset control
  strategy_section_height: string = '450px';
  currentTab = 1;

  // Component attributes
  separatorKeysCodes: number[] = [ENTER, COMMA];
  componentForm = new FormControl<string>('');
  filteredComponents: Observable<string[]>;
  components: string[] = [];
  availableComponents: SwitcherComponent[];
  listComponents: string[] = [];

  constructor(
    private domainRouteService: DomainRouteService,
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private adminService: AdminService,
    private strategyService: StrategyService,
    private componentService: ComponentService,
    private toastService: ToastService,
    private _modalService: NgbModal,
    private dialog: MatDialog
  ) { 
    super();
  }

  ngOnInit() {
    (document.getElementsByClassName('container')[0] as HTMLElement).style.minHeight = '1100px';

    this.loading = true;

    this.route.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = params.name;
    });

    this.route.params.subscribe(params => {
      this.groupId = params.groupid;
      this.configId = params.configid;
      this.loadConfig();
    });

    this.hasNewStrategy = false;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();

    (document.getElementsByClassName('container')[0] as HTMLElement).style.minHeight = '';
  }

  edit() {
    if (!this.editing) {
      this.classStatus = 'header editing';
      this.editing = true;
    } else {
      const { valid } = this.keyFormControl;

      if (valid) {
        this.blockUI.start('Saving changes...');
        this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';

        const body = {
          key: this.keyElement.nativeElement.value,
          description: this.descElement.nativeElement.value
        };
        
        if (super.validateEdition({ 
              key: this.config.key, 
              description: this.config.description,
              components: String(this.config.components.map(component => component.name)),
              disable_metrics: this.config.disable_metrics != undefined ? 
                this.config.disable_metrics[this.currentEnvironment] : false
            },
            { 
              key: body.key, 
              description: body.description,
              components: String(this.components),
              disable_metrics: this.disableMetrics
            })) {
          this.blockUI.stop();
          this.editing = false;
          return;
        }

        this.editConfig(body);
      }
    }
  }

  delete() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Switcher removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this switcher?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.blockUI.start('Removing switcher...');
        this.configService.deleteConfig(this.config.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(_data => {
            this.blockUI.stop();
            this.router.navigate([this.domainRouteService.getPreviousPath()]);
            this.toastService.showSuccess(`Switcher removed with success`);
        }, error => {
          this.blockUI.stop();
          this.toastService.showError(`Unable to remove this switcher`);
          ConsoleLogger.printError(error);
        });
      }
    });
  }

  addStrategy() {
    const dialogRef = this.dialog.open(StrategyCreateComponent, {
      width: '700px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: {
        currentStrategies: this.strategies.getValue()
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe)).subscribe(result => {
      if (result) {
        this.hasNewStrategy = true;
          this.strategyService.createStrategy(
            this.config.id, 
            result.description, 
            result.strategy, 
            result.operation, 
            this.currentEnvironment, 
            result.values).subscribe(_data => {
              this.loadStrategies(true);
              this.toastService.showSuccess('Strategy created with success');
            }, error => {
              this.toastService.showError(error ? error.error : 'Unable to add strategy');
              ConsoleLogger.printError(error);
            });
      }
    });
  }

  addRelay() {
    this.currentTab = 2;
    if (!this.config.relay?.activated) {
      this.config.relay = new ConfigRelay();
      this.config.relay.type = 'VALIDATION';
      this.config.relay.method = 'GET';
    }

    this.config.relay.activated[this.currentEnvironment] = true;
    this.updateData(this.config);

    this.classStrategySection = 'strategy-section relay';
    setTimeout(() => this.currentTab = 2, 500);
  }

  hasRelay() {
    return this.config?.relay.activated ? 
      this.config.relay.activated[this.currentEnvironment] != undefined : false;
  }

  addComponent(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.chipInput.inputElement;
      const value = event.value;

      if (!this.listComponents.includes(value)) {
        return;
      }

      if ((value || '').trim()) {
        this.components.push(value.trim());
      }

      if (input) {
        input.value = '';
      }

      this.componentForm.setValue(null);
    }
  }

  removeComponent(component: string): void {
    const index = this.components.indexOf(component);

    if (index >= 0) {
      this.components.splice(index, 1);
      this.listComponents.push(component);
    }
  }

  onSelectComponent(event: MatAutocompleteSelectedEvent): void {
    this.components.push(event.option.viewValue);
    this.listComponents.splice(this.listComponents.indexOf(event.option.viewValue), 1);
    this.componentInput.nativeElement.value = '';
    this.componentForm.setValue(null);
  }

  onNavChange($event: NgbNavChangeEvent) {
    this.currentTab = $event.nextId;
    this.updateNavTab(this.currentTab);
  }

  updateNavTab(tab: number): void {
    this.currentTab = tab;

    if (this.currentTab === 1) {
      this.classStrategySection = 'strategy-section strategies';
    } else if (this.currentTab === 2) {
      this.classStrategySection = 'strategy-section relay';
    } else {
      this.classStrategySection = 'strategy-section metrics';
    }
  }

  onEnvChange($event: EnvironmentChangeEvent) {
    this.selectEnvironment($event);

    if ($event.reloadPermissions) {
      this.readPermissionToObject();
    }

    this.loadStrategies();
    this.updateNavTab(3);
    this.disableMetrics = this.config.disable_metrics ? 
      this.config.disable_metrics[this.currentEnvironment] : false;
  }

  updateData(config: Config): void {
    this.config = config;
    this.disableMetrics = this.config.disable_metrics ? 
      this.config.disable_metrics[this.currentEnvironment] : false;
    this.loadComponents();
    this.loadStrategies();
    this.keyFormControl.setValue(config.key);

    this.readPermissionToObject();

    this.domainRouteService.updateView(this.config.key, 0);
    this.domainRouteService.updatePath(this.config.id, this.config.key, Types.CONFIG_TYPE, 
      `/dashboard/domain/${this.domainName}/${this.domainId}/groups/${this.groupId}/switchers/${this.config.id}`);
  }

  updateConfigRelay(relay: ConfigRelay) {
    this.config.relay = relay;
  }

  private loadConfig() {
    this.configService.getConfigById(this.configId, true)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(config => {
        if (config) {
          this.updateData(config);
        }
    }, error => {
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to load this Switcher`);
    });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['UPDATE', 'UPDATE_RELAY', 'UPDATE_ENV_STATUS', 'DELETE'], 
      'SWITCHER', 'key', this.config.key, this.currentEnvironment)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          this.updatable = data.find(permission => permission.action === 'UPDATE').result === 'ok';
          this.relayUpdatable = data.find(permission => permission.action === 'UPDATE_RELAY').result === 'ok';
          this.removable = data.find(permission => permission.action === 'DELETE').result === 'ok';
          this.envEnable.next(
            data.find(permission => permission.action === 'UPDATE_ENV_STATUS').result === 'nok' &&
            data.find(permission => permission.action === 'UPDATE').result === 'nok'
          );
        }
    }, error => {
      ConsoleLogger.printError(error);
    }, () => {
      this.loading = false;
      this.detailBodyStyle = 'detail-body ready';
    });

    this.adminService.readCollabPermission(this.domainId, ['CREATE'], 'STRATEGY', undefined, undefined, this.currentEnvironment)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          this.strategiesCreatable = data.find(permission => permission.action === 'CREATE').result === 'ok';
        }
    }, error => {
      ConsoleLogger.printError(error);
    }, () => {
      this.loading = false;
      this.detailBodyStyle = 'detail-body ready';
    });
  }

  public updateEnvironmentStatus(env: EnvironmentChangeEvent): void {
    this.blockUI.start('Updating environment...');
    this.selectEnvironment(env);
    this.configService.setConfigEnvironmentStatus(this.config.id, env.environmentName, env.status)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.blockUI.stop();
          this.toastService.showSuccess(`Environment updated with success`);
        }
    }, error => {
      ConsoleLogger.printError(error);
      this.blockUI.stop();
      this.toastService.showError(`Unable to update the environment '${env.environmentName}'`);
    });
  }

  public removeEnvironmentStatus(env: any): void {
    this.blockUI.start('Removing environment status...');
    this.configService.removeDomainEnvironmentStatus(this.config.id, env)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.config.activated = data.activated;
          this.blockUI.stop();
          this.toastService.showSuccess(`Environment removed with success`);
        }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to remove the environment '${env}'`);
    });
  }

  private loadComponents(): void {
    this.components = this.config.components.map(component => component.name);
    
    this.componentService.getComponentsByDomain(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(values => {
        this.availableComponents = values;

        values = values.filter(value => !this.components.includes(value.name));
        this.listComponents = values.map(value => value.name);
        this.filteredComponents = this.componentForm.valueChanges.pipe(
          startWith(null as string),
          map((component: string | null) => component ? this.filterComponent(component) : this.listComponents.slice()));

        this.blockUI.stop();
      });
  }

  private editConfig(body: { key: string; description: string; }): void {
    const updateDisableMetrics = this.getDisableMetricsChange();
    this.configService.updateConfig(this.config.id,
      body.key != this.config.key ? body.key : undefined,
      body.description != this.config.description ? body.description : undefined, updateDisableMetrics)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.config.key = body.key;
          this.config.description = body.description;
          this.updateConfigComponents();

          this.blockUI.stop();
          this.toastService.showSuccess(`Switcher updated with success`);
          this.editing = false;
        }
      }, error => {
        this.blockUI.stop();
        ConsoleLogger.printError(error);
        this.toastService.showError(`Unable to update switcher`);
        this.classStatus = 'header editing';
        this.editing = true;
      });
  }

  private getDisableMetricsChange(): any {
    if (!this.config.disable_metrics)
      this.config.disable_metrics = new Map<string, boolean>();
    
    this.config.disable_metrics[this.currentEnvironment] = this.disableMetrics;
    return this.config.disable_metrics;
  }

  private updateConfigComponents() {
    const currentConfigComponents = this.config.components.map(component => component.name);
    
    if (this.components.length == currentConfigComponents.length &&
      this.components.every((u, i) => u == currentConfigComponents[i])) {
      return;
    }

    const componentsToUpdate = this.availableComponents
      .filter(c => this.components.includes(c.name))
      .map(c => c.id);

    this.configService.updateConfigComponents(this.config.id, componentsToUpdate)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.config.components = data.components;
          this.toastService.showSuccess(`Switcher Components updated with success`);
        }
    }, error => {
      this.toastService.showError(error ? error.error : 'Something went wront when updating components');
      ConsoleLogger.printError(error);
    });
  }

  private loadStrategies(focus?: boolean) {
    this.loadingStrategies = true;
    this.error = '';
    this.strategyService.getStrategiesByConfig(this.config.id, this.currentEnvironment)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.hasStrategies = data.length > 0;
          this.strategies.next(data);

          if (this.hasStrategies && focus)
            this.updateNavTab(1);
        }
    }, error => {
      ConsoleLogger.printError(error);
      this.loadingStrategies = false;
    }, () => {
      if (!this.strategies.getValue().length) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loadingStrategies = false;
    });
  }

  private filterComponent(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listComponents.filter(component => component.toLowerCase().startsWith(filterValue));
  }
  
}