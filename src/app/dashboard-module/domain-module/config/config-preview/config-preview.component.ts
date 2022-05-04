import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ConfigListComponent } from '../config-list/config-list.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AdminService } from 'src/app/services/admin.service';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { ConfigService } from 'src/app/services/config.service';
import { Types } from 'src/app/model/path-route';
import { Config } from 'protractor';

@Component({
  selector: 'app-config-preview',
  templateUrl: './config-preview.component.html',
  styleUrls: [
    '../../common/css/preview.component.css', 
    './config-preview.component.css'
  ]
})
export class ConfigPreviewComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @BlockUI() blockUI: NgBlockUI;

  @Input() config: Config;
  @Input() configListComponent: ConfigListComponent;

  environmentStatusSelection: FormGroup;
  selectedEnvStatus: boolean;
  selectedEnv: string;

  classStatus: string;
  classBtnStatus: string;

  updatable: boolean = false;
  removable: boolean = false;

  toggleSectionStyle: string = 'toggle-section deactivated';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private adminService: AdminService,
    private domainRouteService: DomainRouteService,
    private configService: ConfigService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadOperationSelectionComponent();
    this.configListComponent.environmentSelectionChange.pipe(takeUntil(this.unsubscribe)).subscribe(envName => {
      this.selectEnvironment(envName);
    });

    this.readPermissionToObject();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getConfig() {
    return this.config;
  }

  selectConfig() {
    this.router.navigate(['/dashboard/domain/group/switcher/detail'], { state: { element: JSON.stringify(this.config) } });
  }

  updateEnvironmentStatus(event: MatSlideToggleChange) {
    this.blockUI.start('Updating environment...');
    this.config.activated[this.selectedEnv] = event.checked;
    this.selectEnvironment(this.selectedEnv);

    this.configService.setConfigEnvironmentStatus(this.getConfig().id, this.selectedEnv, event.checked).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.updatePathRoute(data);
        this.blockUI.stop();
        this.toastService.showSuccess(`Environment updated with success`);
      }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to update the environment '${this.selectedEnv}'`);
    });
  }

  private loadOperationSelectionComponent(): void {
    this.environmentStatusSelection = this.fb.group({
      environmentStatusSelection: [null, Validators.required]
    });
  }

  private updatePathRoute(config: Config) {
    const pathRoute = {
      id: config.id,
      element: config,
      name: config.key,
      path: '/dashboard/domain/group/switcher/detail',
      type: Types.CONFIG_TYPE
    };

    this.domainRouteService.updatePath(pathRoute, false);
  }

  private selectEnvironment(envName: string): void {
    this.selectedEnv = envName;
    const status = this.config.activated[envName] == undefined ? this.config.activated['default'] : this.config.activated[envName];

    this.classStatus = status ? 'grid-container activated' : 'grid-container deactivated';
    this.classBtnStatus = status ? 'header-section activated' : 'header-section deactivated';

    this.environmentStatusSelection.get('environmentStatusSelection').setValue(status);
    this.selectedEnvStatus = status;
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id, 
      ['UPDATE', 'DELETE'], 'SWITCHER', 'name', this.getConfig().name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'UPDATE') {
            this.updatable = element.result === 'ok';
            
            if (!this.updatable) {
              this.environmentStatusSelection.disable({ onlySelf: true });
            } else {
              this.toggleSectionStyle = 'toggle-section';
            }
          } else if (element.action === 'DELETE') {
            this.removable = element.result === 'ok';
          }
        });
      }
    });
  }

}
