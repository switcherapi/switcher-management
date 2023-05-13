import { Component, OnInit, Input, ViewChild, OnDestroy, ElementRef, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DetailComponent } from '../../common/detail-component';
import { EnvironmentChangeEvent } from '../../environment-config/environment-config.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastService } from 'src/app/_helpers/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AdminService } from 'src/app/services/admin.service';
import { Config, ConfigRelay, ConfigRelayStatus } from 'src/app/model/config';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigDetailComponent } from '../config-detail/config-detail.component';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

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

  relayVerificationEnabled: boolean = false;

  constructor(
    private adminService: AdminService,
    private configService: ConfigService,
    private authService: AuthService,
    private toastService: ToastService,
    private _modalService: NgbModal,
    public dialog: MatDialog
  ) {
    super(adminService);
  }

  ngOnInit() {
    super.loadAdmin(this.config.owner);
    this.loadRelay();
    this.readPermissionToObject();
    this.loadRelaySettings();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  edit() {
    // stores old state in case of error
    this.relayOld = JSON.stringify(this.config.relay);

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
        this.blockUI.stop();
        this.editing = false;
        return;
      }

      this.editRelay();
    }
  }

  verifyRelay(): void {
    if (this.config.relay.verification_code) {
      this.openRelayVerificationDialog();
      return;
    }

    this.blockUI.start('Generating verification code...');
    this.configService.getVerificationCode(this.config.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        this.blockUI.stop();
        if (data?.code) {
          this.config.relay.verification_code = data.code;
          this.openRelayVerificationDialog();
        }
      }, error => {
        this.blockUI.stop();
        this.toastService.showError(`Unable to generate a verification code`);
        ConsoleLogger.printError(error);
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
        this.blockUI.start('Removing relay...');
        this.configService.removeConfigRelay(this.config.id, this.currentEnvironment)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(data => {
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

  onEnvChange($event: EnvironmentChangeEvent) {
    this.selectEnvironment($event);
  }

  onEnvStatusChanged($event: EnvironmentChangeEvent) {
    this.updateEnvironmentStatus($event);
  }

  isVerified(): boolean {
    return this.config.relay.verified && this.config.relay.verified[this.currentEnvironment];
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

    this.blockUI.start('Updating relay...');
    this.configService.updateConfigRelay(this.config)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.toastService.showSuccess(`Relay saved with success`);
          this.config = data;
          this.editing = false;
          this.parent.updateData(data);
        }

        this.blockUI.stop();
    }, error => {
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to update relay: ${error.error}`);
      this.editing = false;
      this.blockUI.stop();

      this.config.relay = JSON.parse(this.relayOld);
      this.loadRelay();
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
      this.editing = false;
    }

    this.detailBodyStyle = 'detail-body ready';
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.parent.domainId, ['UPDATE', 'DELETE'], 'SWITCHER', 'key', this.config.key)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          data.forEach(element => {
            if (element.action === 'UPDATE') {
              this.updatable = element.result === 'ok';

              if (!this.editing) {
                this.envEnable.next(!this.updatable);
              }
            } else if (element.action === 'DELETE') {
              this.removable = element.result === 'ok';
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

  private loadRelaySettings(): void {
    this.authService.isAlive()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.relayVerificationEnabled = !data.attributes.relay_bypass_verification);
  }

  private updateEnvironmentStatus(env: EnvironmentChangeEvent): void {
    const configRelayStatus = new ConfigRelayStatus();
    configRelayStatus.activated[env.environmentName] = env.status;

    this.blockUI.start('Updating environment...');
    this.configService.updateConfigRelayStatus(this.config.id, configRelayStatus)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.config.relay.activated[this.currentEnvironment] = env[this.currentEnvironment];
          this.parent.updateData(data);
          this.selectEnvironment(env);
          this.toastService.showSuccess(`Environment updated with success`);
          this.blockUI.stop();
        }
    }, error => {
      this.toastService.showError(`Unable to update the environment '${env.environmentName}'`);
      this.blockUI.stop();
      ConsoleLogger.printError(error);
    });
  }

  private updateConfiguredRelay(data: Config): void {
    delete this.config.relay.activated[this.currentEnvironment];
    if (this.config.relay.auth_token) {
      delete this.config.relay.auth_token[this.currentEnvironment];
    }
    delete this.config.relay.endpoint[this.currentEnvironment];
    this.parent.updateData(data);
    this.parent.updateNavTab(3);
  }

  private openRelayVerificationDialog(): void {
    const dialogRef = this.dialog.open(RelayVerificationDialogComponent, {
      width: '380px',
      data: {
        relay: this.config.relay,
        environment: this.currentEnvironment
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {

        this.blockUI.start('Verifying Relay...');
        this.configService.verifyRelay(this.config.id, this.currentEnvironment)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(response => {
            this.blockUI.stop();
            if (response.status === 'verified') {
              this.toastService.showSuccess(`Relay verified with success`);
              this.config.relay.verified[this.currentEnvironment] = true;
            } else {
              this.toastService.showError(`Failed to verify Relay`);
            }
          }, error => {
            this.blockUI.stop();
            this.toastService.showError(`Unable to verify Relay`);
            ConsoleLogger.printError(error);
          });
      }
    });
  }

  private getRelayAttribute(field: string): string {
    if (this.config.relay[field] && this.config.relay[field][this.currentEnvironment])
      return this.config.relay[field][this.currentEnvironment];
    return '';
  }

}

@Component({
  selector: 'relay-detail.verify-dialog',
  templateUrl: './relay-detail.verify-dialog.html',
  styleUrls: [
    '../../common/css/create.component.css',
    './relay-detail.component.css'
  ]
})
export class RelayVerificationDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<RelayVerificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

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
