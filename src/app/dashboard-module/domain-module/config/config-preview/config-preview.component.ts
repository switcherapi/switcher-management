import { Component, OnInit, Input, OnDestroy, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfigService } from 'src/app/services/config.service';
import { Permissions } from 'src/app/model/permission';
import { Config } from 'src/app/model/config';
import { BasicComponent } from '../../common/basic-component';

@Component({
  selector: 'app-config-preview',
  templateUrl: './config-preview.component.html',
  styleUrls: [
    '../../common/css/preview.component.css', 
    './config-preview.component.css'
  ],
  standalone: false
})
export class ConfigPreviewComponent extends BasicComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly configService = inject(ConfigService);
  private readonly toastService = inject(ToastService);

  private readonly unsubscribe = new Subject<void>();

  @Input() domainId: string;
  @Input() domainName: string;
  @Input() groupId: string;
  @Input() config: Config;
  @Input() environmentSelectionChange: EventEmitter<string>;
  @Input() permissions: Permissions[];

  environmentStatusSelection: FormGroup;
  selectedEnvStatus: boolean;
  selectedEnv: string;

  classStatus: string;
  classBtnStatus: string;

  updatable = false;
  removable = false;

  toggleSectionStyle = 'toggle-section deactivated';

  constructor() { 
    super();
  }

  ngOnInit() {
    this.readPermissionToObject();
    this.loadOperationSelectionComponent();
    this.environmentSelectionChange.pipe(takeUntil(this.unsubscribe)).subscribe(envName => {
      this.selectEnvironment(envName);
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  selectConfig() {
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/groups/${this.groupId}/switchers/${this.config.id}`]);
  }

  updateEnvironmentStatus(event: MatSlideToggleChange) {
    this.setBlockUI(true, 'Updating environment...');
    this.config.activated[this.selectedEnv] = event.checked;
    this.selectEnvironment(this.selectedEnv);

    this.configService.setConfigEnvironmentStatus(this.config.id, this.selectedEnv, event.checked)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.config.activated = data.activated;
            this.setBlockUI(false);
            this.toastService.showSuccess(`Environment updated with success`);
          }
        },
        error: error => {
          this.setBlockUI(false);
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to update the environment '${this.selectedEnv}'`);
        }
      });
  }

  private loadOperationSelectionComponent(): void {
    this.environmentStatusSelection = this.fb.group({
      environmentStatusSelection: [null, Validators.required]
    });
  }

  private selectEnvironment(envName: string): void {
    this.selectedEnv = envName;
    const status = this.config.activated[envName] ?? this.config.activated['default'];

    this.classStatus = status ? 'grid-container activated' : 'grid-container deactivated';
    this.classBtnStatus = status ? 'header-section activated' : 'header-section deactivated';

    this.environmentStatusSelection.get('environmentStatusSelection').setValue(status);
    this.selectedEnvStatus = status;
  }

  private readPermissionToObject(): void {
    this.loadOperationSelectionComponent();

    const element = this.permissions.filter(p => p.id === this.config.id)[0];
    this.updatable = element.permissions.find(p => p.action === 'UPDATE').result === 'ok';
    this.removable = element.permissions.find(p => p.action === 'DELETE').result === 'ok';
    
    if (this.isEnvStatusChangeAllowed(element)) {
      this.enableEnvStatusControl();
    } else {
      this.disableEnvStatusControl();
    }
  }

  private enableEnvStatusControl(): void {
    this.toggleSectionStyle = 'toggle-section';
  }

  private disableEnvStatusControl(): void {
    this.environmentStatusSelection.disable({ onlySelf: true });
  }

  private isEnvStatusChangeAllowed(element: Permissions): boolean {
    return element.permissions.find(p => p.action === 'UPDATE_ENV_STATUS').result === 'ok' ||
      element.permissions.find(p => p.action === 'UPDATE').result === 'ok'
  }

}
