import { Component, OnInit, Input, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DetailComponent } from '../../common/detail-component';
import { EnvironmentConfigComponent } from '../../environment-config/environment-config.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastService } from 'src/app/_helpers/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirm } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { AdminService } from 'src/app/services/admin.service';
import { Types } from 'src/app/model/path-route';
import { Config, ConfigRelayStatus } from 'src/app/model/config';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigDetailComponent } from '../config-detail/config-detail.component';

@Component({
  selector: 'app-relay-detail',
  templateUrl: './relay-detail.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    './relay-detail.component.css'
  ]
})
export class RelayDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @BlockUI() blockUI: NgBlockUI;

  @Input() config: Config;
  @Input() parent: ConfigDetailComponent;
  @Input() currentEnvironment: string;

  @ViewChild('envSelectionChange', { static: true })
  private envSelectionChange: EnvironmentConfigComponent;

  @ViewChild('descElement', { static: true })
  descElement: ElementRef;

  endpointFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5)
  ]);

  @ViewChild('authPrefixElement', { static: true })
  authPrefixElement: ElementRef;

  @ViewChild('authTokenElement', { static: true })
  authTokenElement: ElementRef;

  relayTypeFormControl = new FormControl('');
  relayMethodFormControl = new FormControl('');

  classStatus: string;

  constructor(
    private domainRouteService: DomainRouteService,
    private adminService: AdminService,
    private configService: ConfigService,
    private toastService: ToastService,
    private _modalService: NgbModal
  ) {
    super(adminService);
  }

  ngOnInit() {
    this.envSelectionChange.outputEnvChanged.pipe(takeUntil(this.unsubscribe)).subscribe(status => {
      this.selectEnvironment(status);
      this.loadRelay();
    });

    this.envSelectionChange.outputStatusChanged.pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.updateEnvironmentStatus(env);
    });

    super.loadAdmin(this.config.owner);
    this.readPermissionToObject();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadRelay(): void {
    this.currentStatus = this.config.relay.activated[this.envSelectionChange.selectedEnvName];

    this.relayTypeFormControl.setValue(this.config.relay.type);
    this.relayMethodFormControl.setValue(this.config.relay.method);
    this.endpointFormControl.setValue(this.getRelayAttribute('endpoint'));
    this.authTokenElement.nativeElement.value = this.getRelayAttribute('auth_token');

    if (this.config.relay.endpoint[this.envSelectionChange.selectedEnvName] == undefined) {
      this.edit();
    } else {
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
      this.editing = false;
    }

    this.detailBodyStyle = 'detail-body ready';
  }

  readPermissionToObject(): void {
    const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.adminService.readCollabPermission(domain.id, ['UPDATE', 'DELETE'], 'SWITCHER', 'key', this.config.key)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'UPDATE') {
            this.updatable = element.result === 'ok' ? true : false;

            if (!this.editing) {
              this.envSelectionChange.disableEnvChange(!this.updatable);
            }
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

  updateEnvironmentStatus(env: any): void {
    const configRelayStatus = new ConfigRelayStatus();
    configRelayStatus.activated[env.environment] = env.status;

    this.blockUI.start('Updating environment...');
    this.configService.updateConfigRelayStatus(this.config.id, configRelayStatus).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.config.relay.activated[this.currentEnvironment] = env[this.currentEnvironment];
        this.parent.loadConfig(data);
        this.selectEnvironment(env.status);
        this.toastService.showSuccess(`Environment updated with success`);
        this.blockUI.stop();
      }
    }, error => {
      this.toastService.showError(`Unable to update the environment '${env.environment}'`);
      this.blockUI.stop();
    });
  }

  edit() {
    if (!this.editing) {
      this.classStatus = 'header editing';
      this.editing = true;
    } else {
      const { valid } = this.endpointFormControl;
      if (!valid) {
        this.toastService.showError(`Unable to save relay`);
        return;
      }

      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';

      if (super.validateEdition(
        { 
          type: this.config.relay.type,
          method: this.config.relay.method,
          description: this.config.relay.description,
          endpoint: this.config.relay.endpoint[this.envSelectionChange.selectedEnvName],
          auth_token: this.getRelayAttribute('auth_token') ? this.config.relay.auth_token[this.envSelectionChange.selectedEnvName] : '',
          auth_prefix: this.config.relay.auth_prefix || ''
        }, 
        { 
          type: this.relayTypeFormControl.value,
          method: this.relayMethodFormControl.value,
          description: this.descElement.nativeElement.value,
          endpoint: this.endpointFormControl.value,
          auth_token: this.authTokenElement.nativeElement.value,
          auth_prefix: this.authPrefixElement.nativeElement.value
        })) {
        this.blockUI.stop();
        this.editing = false;
        return;
      }

      this.envSelectionChange.disableEnvChange(!this.editing);
      this.config.relay.type = this.relayTypeFormControl.value;
      this.config.relay.method = this.relayMethodFormControl.value;
      this.config.relay.description = this.descElement.nativeElement.value;
      this.config.relay.endpoint[this.envSelectionChange.selectedEnvName] = this.endpointFormControl.value;

      if (!this.config.relay.auth_token) {
        this.config.relay.auth_token = new Map<string, string>();
      }
      this.config.relay.auth_token[this.envSelectionChange.selectedEnvName] = this.authTokenElement.nativeElement.value;
      this.config.relay.auth_prefix = this.authPrefixElement.nativeElement.value;

      this.configService.updateConfigRelay(this.config).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.toastService.showSuccess(`Relay saved with success`);
          this.config = data;
          this.editing = false;
          this.parent.loadConfig(data);
        }
      }, error => {
        ConsoleLogger.printError(error);
        this.toastService.showError(`Unable to update relay`);
        this.editing = false;
      });
    }
  }

  delete() {
    if (!this.config.relay.endpoint[this.envSelectionChange.selectedEnvName]) {
      this.updateConfiguredRelay(this.config);
      return;
    }

    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Relay removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this relay?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.blockUI.start('Removing relay...');
        this.configService.removeConfigRelay(this.config.id, this.envSelectionChange.selectedEnvName)
          .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            if (data) {
              this.updateConfiguredRelay(data);
            }
            this.blockUI.stop();
        }, error => {
          this.blockUI.stop();
          this.toastService.showError(`Unable to remove this relay`);
          ConsoleLogger.printError(error);
        });
      }
    });
  }

  private updateConfiguredRelay(data: Config): void {
    delete this.config.relay.activated[this.envSelectionChange.selectedEnvName];
    if (this.config.relay.auth_token) {
      delete this.config.relay.auth_token[this.envSelectionChange.selectedEnvName];
    }
    delete this.config.relay.endpoint[this.envSelectionChange.selectedEnvName];
    this.parent.updatePathRoute(data);
    this.parent.updateNavTab(3);
  }

  getRelayAttribute(field: string): string {
    if (this.config.relay[field] && this.config.relay[field][this.envSelectionChange.selectedEnvName])
      return this.config.relay[field][this.envSelectionChange.selectedEnvName];
    return '';
  }

}