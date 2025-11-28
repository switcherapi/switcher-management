import { Component, OnInit, Input, ViewChild, OnDestroy, ElementRef, inject, signal } from '@angular/core';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailComponent } from '../../common/detail-component';
import { EnvironmentChangeEvent, EnvironmentConfigComponent } from '../../environment-config/environment-config.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastService } from 'src/app/_helpers/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { AdminService } from 'src/app/services/admin.service';
import { Config, ConfigRelayStatus } from 'src/app/model/config';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigDetailComponent } from '../config-detail/config-detail.component';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { DomainService } from 'src/app/services/domain.service';
import { BlockUIComponent } from '../../../../shared/block-ui/block-ui.component';
import { NgClass, NgStyle } from '@angular/common';
import { MatFormField, MatLabel, MatInput, MatHint, MatError } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-relay-detail',
    templateUrl: './relay-detail.component.html',
    styleUrls: [
        '../../common/css/detail.component.css',
        './relay-detail.component.css'
    ],
    imports: [BlockUIComponent, NgClass, MatFormField, MatLabel, MatInput, MatSelect, FormsModule, 
      ReactiveFormsModule, MatOption, NgStyle, MatHint, MatError, EnvironmentConfigComponent, 
      MatButton, MatIcon
    ]
})
export class RelayDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private readonly domainService = inject(DomainService);
  private readonly configService = inject(ConfigService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly _modalService = inject(NgbModal);
  dialog = inject(MatDialog);

  private readonly unsubscribe = new Subject<void>();

  @Input() config: Config;
  @Input() parent: ConfigDetailComponent;
  @Input() declare currentEnvironment: string;

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

  envEnable = new Subject<boolean>();
  relayOld: string;

  relayTypeFormControl = new FormControl('');
  relayMethodFormControl = new FormControl('');

  relayVerificationEnabled = signal(false);
  relayVerificationCode = signal('');

  constructor() {
    super();
  }

  ngOnInit() {
    this.loadRelay();
    this.readPermissionToObject();
    this.loadRelaySettings();
    this.loadIntegrationSettings();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  edit() {
    // stores old state in case of error
    this.relayOld = JSON.stringify(this.config.relay);

    if (!this.editing()) {
      this.classStatus = 'header editing';
      this.editing.set(true);
      return;
    }
    
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
        endpoint: this.config.relay.endpoint[this.currentEnvironment],
        auth_token: this.getRelayAttribute('auth_token') ? this.config.relay.auth_token[this.currentEnvironment] : '',
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
      this.setBlockUI(false);
      this.editing.set(false);
      return;
    }

    this.editRelay();
  }

  verifyRelay(): void {
    if (this.relayVerificationCode()) {
      this.openRelayVerificationDialog();
      return;
    }

    this.setBlockUI(true, 'Generating verification code...');
    this.domainService.getVerificationCode(this.parent.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          this.setBlockUI(false);
          if (data?.code) {
            this.relayVerificationCode.set(data.code);
            this.openRelayVerificationDialog();
          }
        },
        error: error => {
          this.setBlockUI(false);
          this.toastService.showError(`Unable to generate a verification code`);
          ConsoleLogger.printError(error);
        }
      });
  }

  delete() {
    if (!this.config.relay.endpoint[this.currentEnvironment]) {
      this.updateConfiguredRelay(this.config);
      return;
    }

    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Relay removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this relay?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.setBlockUI(true, 'Removing relay...');
        this.configService.removeConfigRelay(this.config.id, this.currentEnvironment)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: data => {
              if (data) {
                this.updateConfiguredRelay(data);
              }
              this.setBlockUI(false);
            },
            error: error => {
              this.setBlockUI(false);
              this.toastService.showError(`Unable to remove this relay`);
              ConsoleLogger.printError(error);
            }
          });
      }
    });
  }

  isVerified(): boolean {
    if (this.config.relay.verified)
      return this.config.relay.verified[this.currentEnvironment];
    return false;
  }

  private editRelay() {
    this.envEnable.next(!this.editing);
    this.config.relay.type = this.relayTypeFormControl.value;
    this.config.relay.method = this.relayMethodFormControl.value;
    this.config.relay.description = this.descElement.nativeElement.value;
    this.config.relay.endpoint[this.currentEnvironment] = this.endpointFormControl.value;

    if (!this.config.relay.auth_token) {
      this.config.relay.auth_token = new Map<string, string>();
    }
    
    this.config.relay.auth_token[this.currentEnvironment] = this.authTokenElement.nativeElement.value;
    this.config.relay.auth_prefix = this.authPrefixElement.nativeElement.value;

    this.setBlockUI(true, 'Updating relay...');
    this.configService.updateConfigRelay(this.config)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.toastService.showSuccess(`Relay saved with success`);
            this.config.relay = data.relay;
            this.editing.set(false);
            this.parent.updateConfigRelay(data.relay);
          }
          this.setBlockUI(false);
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to update relay: ${error.error}`);
          this.editing.set(false);
          this.setBlockUI(false);

          this.config.relay = JSON.parse(this.relayOld);
          this.loadRelay();
        }
      });
  }

  private loadRelay(): void {
    this.currentStatus = this.config.relay.activated[this.currentEnvironment];

    this.relayTypeFormControl.setValue(this.config.relay.type);
    this.relayMethodFormControl.setValue(this.config.relay.method);
    this.endpointFormControl.setValue(this.getRelayAttribute('endpoint'));
    this.authTokenElement.nativeElement.value = this.getRelayAttribute('auth_token');

    if (this.config.relay.endpoint[this.currentEnvironment] == undefined) {
      this.edit();
    } else {
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
      this.editing.set(false);
    }

    this.detailBodyStyle.set('detail-body ready');
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.parent.domainId, ['UPDATE', 'UPDATE_RELAY', 'UPDATE_ENV_STATUS', 'DELETE', 'DELETE_RELAY'], 
      'SWITCHER', 'key', this.config.key, this.currentEnvironment)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data.length) {
            this.removable = 
              data.find(permission => permission.action === 'DELETE').result === 'ok' ||
              data.find(permission => permission.action === 'DELETE_RELAY').result === 'ok';
            this.updatable = 
              data.find(permission => permission.action === 'UPDATE').result === 'ok' ||
              data.find(permission => permission.action === 'UPDATE_RELAY').result === 'ok';
            this.envEnable.next(
              data.find(permission => permission.action === 'UPDATE_ENV_STATUS').result === 'nok' &&
              data.find(permission => permission.action === 'UPDATE').result === 'nok'
            );
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
        },
        complete: () => {
          this.setBlockUI(false);
          this.detailBodyStyle.set('detail-body ready');
        }
      });
  }

  private loadRelaySettings(): void {
    this.authService.isAlive()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.relayVerificationEnabled.set(!data.attributes.relay_bypass_verification));
  }

  private loadIntegrationSettings(): void {
    this.domainService.getDomain(this.parent.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.relayVerificationCode.set(data.integrations.relay.verification_code));
  }

  public updateEnvironmentStatus(env: EnvironmentChangeEvent): void {
    const configRelayStatus = new ConfigRelayStatus();
    configRelayStatus.activated[env.environmentName] = env.status;

    this.setBlockUI(true, 'Updating environment...');
    this.configService.updateConfigRelayStatus(this.config.id, configRelayStatus)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.config.relay.activated[this.currentEnvironment] = env[this.currentEnvironment];
            this.parent.updateConfigRelay(data.relay);
            this.selectEnvironment(env);
            this.toastService.showSuccess(`Environment updated with success`);
            this.setBlockUI(false);
          }
        },
        error: error => {
          this.toastService.showError(`Unable to update the environment '${env.environmentName}'`);
          this.setBlockUI(false);
          ConsoleLogger.printError(error);
        }
      });
  }

  private updateConfiguredRelay(data: Config): void {
    delete this.config.relay.activated[this.currentEnvironment];
    if (this.config.relay.auth_token) {
      delete this.config.relay.auth_token[this.currentEnvironment];
    }
    delete this.config.relay.endpoint[this.currentEnvironment];
    this.parent.updateConfigRelay(data.relay);
    this.parent.updateNavTab(1);
  }

  private openRelayVerificationDialog(): void {
    const dialogRef = this.dialog.open(RelayVerificationDialogComponent, {
      width: '380px',
      data: {
        relay: this.config.relay,
        code: this.relayVerificationCode(),
        environment: this.currentEnvironment
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.setBlockUI(true, 'Verifying Relay...');
        this.configService.verifyRelay(this.config.id, this.currentEnvironment)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: response => {
              this.setBlockUI(false);
              if (response.status === 'verified') {
                this.toastService.showSuccess(`Relay verified with success`);
                this.config.relay.verified[this.currentEnvironment] = true;
              } else {
                this.toastService.showError(`Failed to verify Relay`);
              }
            },
            error: error => {
              this.setBlockUI(false);
              this.toastService.showError(`Unable to verify Relay`);
              ConsoleLogger.printError(error);
            }
          });
      }
    });
  }

  private getRelayAttribute(field: string): string {
    if (this.config.relay[field]) {
      if (this.config.relay[field][this.currentEnvironment])
        return this.config.relay[field][this.currentEnvironment];
    }
    return '';
  }

}

@Component({
    selector: 'app-relay-detail.verify-dialog',
    templateUrl: './relay-detail.verify-dialog.html',
    styleUrls: [
        '../../common/css/create.component.css',
        './relay-detail.component.css'
    ],
    imports: [MatDialogTitle, MatToolbar, MatIconButton, MatIcon, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, FormsModule, MatDialogActions, MatButton]
})
export class RelayVerificationDialogComponent {
  dialogRef = inject<MatDialogRef<RelayVerificationDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  onVerify(data: any): void {
    this.dialogRef.close(data);
  }

  onCancel() {
    this.dialogRef.close();
  }

  getVerificationUrl(): string {
    const endpoint = this.data.relay.endpoint[this.data.environment].replace(/\/$/, '');
    return `${endpoint?.substring(0, endpoint.lastIndexOf('/'))}/verify`;
  }

}
