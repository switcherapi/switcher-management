import { Component, OnDestroy, inject, input, computed, signal, effect, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material/slide-toggle';
import { ConfigService } from 'src/app/services/config.service';
import { Permissions } from 'src/app/model/permission';
import { Config } from 'src/app/model/config';
import { BasicComponent } from '../../common/basic-component';
import { BlockUIComponent } from '../../../../shared/block-ui/block-ui.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-config-preview',
    templateUrl: './config-preview.component.html',
    styleUrls: [
        '../../common/css/preview.component.css',
        './config-preview.component.css'
    ],
    imports: [BlockUIComponent, NgClass, FormsModule, ReactiveFormsModule, MatSlideToggle]
})
export class ConfigPreviewComponent extends BasicComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly configService = inject(ConfigService);
  private readonly toastService = inject(ToastService);

  private readonly unsubscribe = new Subject<void>();

  domainId = input.required<string>();
  domainName = input.required<string>();
  groupId = input.required<string>();
  config = input.required<Config>();
  environmentSelectionChange = input.required<EventEmitter<string>>();
  permissions = input.required<Permissions[]>();

  environmentStatusSelection = signal<FormGroup | null>(null);
  selectedEnvStatus = signal<boolean>(false);
  selectedEnv = signal<string>('');

  classStatus = computed(() => {
    const status = this.config().activated[this.selectedEnv()] ?? this.config().activated['default'];
    return status ? 'grid-container activated' : 'grid-container deactivated';
  });
  
  classBtnStatus = computed(() => {
    const status = this.config().activated[this.selectedEnv()] ?? this.config().activated['default'];
    return status ? 'header-section activated' : 'header-section deactivated';
  });

  updatable = signal<boolean>(false);
  removable = signal<boolean>(false);

  toggleSectionStyle = signal<string>('toggle-section deactivated');

  constructor() { 
    super();
    
    // Initialize form and permissions when component is created
    effect(() => {
      this.readPermissionToObject();
      this.loadOperationSelectionComponent();
    }, { allowSignalWrites: true });
    
    // Subscribe to environment changes
    effect(() => {
      const envChangeEmitter = this.environmentSelectionChange();
      envChangeEmitter.pipe(takeUntil(this.unsubscribe)).subscribe(envName => {
        this.selectEnvironment(envName);
      });
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  selectConfig() {
    const domainName = this.domainName();
    const domainId = this.domainId();
    const groupId = this.groupId();
    const config = this.config();
    this.router.navigate([`/dashboard/domain/${domainName}/${domainId}/groups/${groupId}/switchers/${config.id}`]);
  }

  updateEnvironmentStatus(event: MatSlideToggleChange) {
    this.setBlockUI(true, 'Updating environment...');
    const config = this.config();
    const selectedEnv = this.selectedEnv();
    
    config.activated[selectedEnv] = event.checked;
    this.selectEnvironment(selectedEnv);

    this.configService.setConfigEnvironmentStatus(config.id, selectedEnv, event.checked)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            const updatedConfig = this.config();
            updatedConfig.activated = data.activated;
            this.setBlockUI(false);
            this.toastService.showSuccess(`Environment updated with success`);
          }
        },
        error: error => {
          this.setBlockUI(false);
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to update the environment '${selectedEnv}'`);
        }
      });
  }

  private loadOperationSelectionComponent(): void {
    const formGroup = this.fb.group({
      environmentStatusSelection: [null, Validators.required]
    });
    this.environmentStatusSelection.set(formGroup);
  }

  private selectEnvironment(envName: string): void {
    this.selectedEnv.set(envName);
    const config = this.config();
    const status = config.activated[envName] ?? config.activated['default'];

    const form = this.environmentStatusSelection();
    if (form) {
      form.get('environmentStatusSelection')?.setValue(status);
    }
    this.selectedEnvStatus.set(status);
  }

  private readPermissionToObject(): void {
    this.loadOperationSelectionComponent();

    const permissions = this.permissions();
    const config = this.config();
    const element = permissions.find(p => p.id === config.id);
    
    if (element) {
      this.updatable.set(element.permissions.find(p => p.action === 'UPDATE')?.result === 'ok');
      this.removable.set(element.permissions.find(p => p.action === 'DELETE')?.result === 'ok');
      
      if (this.isEnvStatusChangeAllowed(element)) {
        this.enableEnvStatusControl();
      } else {
        this.disableEnvStatusControl();
      }
    }
  }

  private enableEnvStatusControl(): void {
    this.toggleSectionStyle.set('toggle-section');
  }

  private disableEnvStatusControl(): void {
    const form = this.environmentStatusSelection();
    if (form) {
      form.disable({ onlySelf: true });
    }
  }

  private isEnvStatusChangeAllowed(element: Permissions): boolean {
    return element.permissions.find(p => p.action === 'UPDATE_ENV_STATUS').result === 'ok' ||
      element.permissions.find(p => p.action === 'UPDATE').result === 'ok'
  }

}
