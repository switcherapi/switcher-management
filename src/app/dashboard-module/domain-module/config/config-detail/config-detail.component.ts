import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, takeUntil, startWith } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { DetailComponent } from '../../common/detail-component';
import { EnvironmentConfigComponent } from '../../environment-config/environment-config.component';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirm } from 'src/app/_helpers/confirmation-dialog';
import { StrategyCreateComponent } from '../strategy-create/strategy-create.component';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatChipInputEvent } from '@angular/material/chips';
import { Strategy } from 'src/app/model/strategy';
import { SwitcherComponent } from 'src/app/model/switcher-component';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { PathRoute, Types } from 'src/app/model/path-route';
import { ConfigService } from 'src/app/services/config.service';
import { AdminService } from 'src/app/services/admin.service';
import { StrategyService } from 'src/app/services/strategy.service';
import { ComponentService } from 'src/app/services/component.service';
import { Config } from 'src/app/model/config';

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

  @ViewChild('envSelectionChange', { static: true })
  private envSelectionChange: EnvironmentConfigComponent;

  @ViewChild('descElement', { static: true }) 
  descElement: ElementRef;

  @ViewChild('keyElement', { static: true }) 
  keyElement: ElementRef;
  
  @ViewChild('componentInput') 
  componentInput: ElementRef<HTMLInputElement>;
  
  @ViewChild('auto') 
  matAutocomplete: MatAutocomplete;

  keyFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ]);

  classStatus: string;
  
  config: Config;
  strategies:  Strategy[];
  loading = false;
  hasStrategies = false;
  hasNewStrategy = false;
  error = '';

  // Component attributes
  separatorKeysCodes: number[] = [ENTER, COMMA];
  componentForm = new FormControl();
  filteredComponents: Observable<string[]>;
  components: string[] = [];
  availableComponents: SwitcherComponent[];
  listComponents: string[] = [];

  constructor(
    private domainRouteService: DomainRouteService,
    private pathRoute: PathRoute,
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private adminService: AdminService,
    private strategyService: StrategyService,
    private componentService: ComponentService,
    private errorHandler: RouterErrorHandler,
    private toastService: ToastService,
    private _modalService: NgbModal,
    private dialog: MatDialog
  ) { 
    super(adminService);
  }

  ngOnInit() {
    this.blockUI.start('Loading...');
    this.hasNewStrategy = false;
    this.route.paramMap
      .pipe(takeUntil(this.unsubscribe), map(() => window.history.state)).subscribe(data => {
        if (data.element) {
          this.loadConfig(JSON.parse(data.element));
        } else {
          this.loadConfig(this.domainRouteService.getPathElement(Types.SELECTED_CONFIG).element);
        }
      });

    this.envSelectionChange.outputEnvChanged.pipe(takeUntil(this.unsubscribe)).subscribe(status => {
      this.selectEnvironment(status);
      this.initStrategies();
    });

    this.envSelectionChange.outputStatusChanged.pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.updateEnvironmentStatus(env);
    });

    this.envSelectionChange.outputEnvRemoved.pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.removeEnvironmentStatus(env);
    });

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
  
  scrollToElement($element): void {
    setTimeout(() => {
      $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
    }, 500);
  }

  getConfig(): Config {
    return this.pathRoute.element;
  }

  loadComponents(): void {
    this.components = this.config.components.map(component => component.name);
    
    this.componentService.getComponentsByDomain(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(values => {
        this.availableComponents = values;

        values = values.filter(value => !this.components.includes(value.name));
        this.listComponents = values.map(value => value.name);
        this.filteredComponents = this.componentForm.valueChanges.pipe(
          startWith(null),
          map((component: string | null) => component ? this._filter(component) : this.listComponents.slice()));

        this.blockUI.stop();
      });
  }

  loadConfig(config: Config) {
    this.updatePathRoute(config);
    this.configService.getConfigById(config.id, true).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.config = data;
        this.loadComponents();
        super.loadAdmin(this.config.owner);
        this.keyFormControl.setValue(config.key);
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to load this Switcher`);
    });
  }

  updatePathRoute(config: Config): void {
    this.pathRoute = {
      id: config.id,
      element: config,
      name: config.key,
      path: '/dashboard/domain/group/switcher/detail',
      type: Types.CONFIG_TYPE
    };

    this.domainRouteService.updatePath(this.pathRoute, true);
    this.readPermissionToObject();
  }

  readPermissionToObject(): void {
    const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.adminService.readCollabPermission(domain.id, ['UPDATE', 'DELETE'], 'SWITCHER', 'key', this.getConfig().key)
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
    }, error => {
      ConsoleLogger.printError(error);
    }, () => {
      this.blockUI.stop();
      this.detailBodyStyle = 'detail-body ready';
    });
  }

  updateEnvironmentStatus(env : any): void {
    this.blockUI.start('Updating environment...');
    this.selectEnvironment(env.status);
    this.configService.setConfigEnvironmentStatus(this.config.id, env.environment, env.status).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.loadConfig(data);
        this.blockUI.stop();
        this.toastService.showSuccess(`Environment updated with success`);
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.blockUI.stop();
      this.toastService.showError(`Unable to update the environment '${env.environment}'`);
    });
  }

  removeEnvironmentStatus(env : any): void {
    this.blockUI.start('Removing environment status...');
    this.configService.removeDomainEnvironmentStatus(this.config.id, env).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.updatePathRoute(data);
        this.blockUI.stop();
        this.toastService.showSuccess(`Environment removed with success`);
      }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to remove the environment '${env}'`);
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
      const { valid } = this.keyFormControl;

      if (valid) {
        this.blockUI.start('Saving changes...');
        this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';

        const body = {
          key: this.keyElement.nativeElement.value,
          description: this.descElement.nativeElement.value
        };
        
        if (super.validateEdition(
            { 
              key: this.pathRoute.name, 
              description: this.pathRoute.element.description,
              components: this.config.components.length
            },
            { 
              key: body.key, 
              description: body.description,
              components: this.components.length
            })) {
          this.blockUI.stop();
          this.editing = false;
          return;
        }

        this.configService.updateConfig(this.config.id, 
          body.key != this.pathRoute.name ? body.key : undefined, 
          body.description != this.pathRoute.element.description ? body.description : undefined).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          if (data) {
            this.updateConfigComponents(data);
            this.toastService.showSuccess(`Switcher updated with success`);
            this.editing = false
          }
        }, error => {
          this.blockUI.stop();
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to update switcher`);
          this.classStatus = 'header editing';
          this.editing = true;
        }, () => {
          this.blockUI.stop();
        });
      }
    }
  }

  delete() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Switcher removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this switcher?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.blockUI.start('Removing switcher...');
        this.configService.deleteConfig(this.config.id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          this.domainRouteService.removePath(Types.CONFIG_TYPE);
          this.blockUI.stop();
          this.router.navigate(['/dashboard/domain/group/detail']);
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
        currentStrategies: this.strategies
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
            this.envSelectionChange.selectedEnvName, 
            result.values).subscribe(data => {
              this.initStrategies();
              this.toastService.showSuccess(`Strategy created with success`);
            }, error => {
              this.toastService.showError(error ? error.error : 'Unable to add strategy');
              ConsoleLogger.printError(error);
            });
      }
    });
  }

  private updateConfigComponents(config: Config): void {
    const currentConfigComponents = this.config.components.map(component => component.name);

    if (this.components.length != currentConfigComponents.length || 
      this.components.every((u, i) => u != currentConfigComponents[i])
    ) {
      const componentsToUpdate = this.availableComponents.filter(c => this.components.includes(c.name)).map(c => c.id);
      
      if (componentsToUpdate.length) {
        this.configService.updateConfigComponents(this.config.id, componentsToUpdate).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          if (data) {
            this.config = data;
            this.loadConfig(data);
          }
        }, error => {
          this.blockUI.stop();
          this.toastService.showError(error ? error.error : 'Something went wront when updating components');
          ConsoleLogger.printError(error);
        });
      }
    } else {
      this.loadConfig(config);
    }
  }

  private initStrategies() {
    this.loading = true;
    this.error = '';
    this.strategyService.getStrategiesByConfig(this.pathRoute.id, this.envSelectionChange.selectedEnvName).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.hasStrategies = data.length > 0;
        this.strategies = data;
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.loading = false;
    }, () => {
      if (!this.strategies) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    });
  }

  addComponent(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
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

  selected(event: MatAutocompleteSelectedEvent): void {
    this.components.push(event.option.viewValue);
    this.listComponents.splice(this.listComponents.indexOf(event.option.viewValue), 1);
    this.componentInput.nativeElement.value = '';
    this.componentForm.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listComponents.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  }
  
}