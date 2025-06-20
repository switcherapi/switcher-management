import { Component, OnInit, Input, OnDestroy, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Group } from 'src/app/model/group';
import { GroupService } from 'src/app/services/group.service';
import { Permissions } from 'src/app/model/permission';
import { BasicComponent } from '../../common/basic-component';

@Component({
  selector: 'app-group-preview',
  templateUrl: './group-preview.component.html',
  styleUrls: [
    '../../common/css/preview.component.css', 
    './group-preview.component.css'
  ],
  standalone: false
})
export class GroupPreviewComponent extends BasicComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly groupService = inject(GroupService);
  private readonly toastService = inject(ToastService);

  private readonly unsubscribe = new Subject<void>();
  
  @Input() domainId: string;
  @Input() domainName: string;
  @Input() group: Group;
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
    this.environmentSelectionChange.pipe(takeUntil(this.unsubscribe)).subscribe(envName => {
      this.selectEnvironment(envName);
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  selectGroup() {
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/groups/${this.group.id}`]);
  }

  selectEnvironment(envName: string): void {
    this.selectedEnv = envName;
    const status = this.group.activated[envName] ?? this.group.activated['default'];

    this.classStatus = status ? 'grid-container activated' : 'grid-container deactivated';
    this.classBtnStatus = status ? 'header-section activated' : 'header-section deactivated';

    this.environmentStatusSelection.get('environmentStatusSelection').setValue(status);
    this.selectedEnvStatus = status;
  }

  updateEnvironmentStatus(event: MatSlideToggleChange) {
    this.setBlockUI(true, 'Updating environment...');
    this.group.activated[this.selectedEnv] = event.checked;
    this.selectEnvironment(this.selectedEnv);

    this.groupService.setGroupEnvironmentStatus(this.group.id, this.selectedEnv, event.checked)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.group.activated = data.activated;
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

  private readPermissionToObject(): void {
    this.loadOperationSelectionComponent();

    const element = this.permissions.filter(p => p.id === this.group.id)[0];
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
