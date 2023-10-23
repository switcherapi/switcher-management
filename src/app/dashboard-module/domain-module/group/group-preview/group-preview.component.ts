import { Component, OnInit, Input, OnDestroy, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from 'src/app/_helpers/toast.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Group } from 'src/app/model/group';
import { GroupService } from 'src/app/services/group.service';
import { Permissions } from 'src/app/model/permission';

@Component({
  selector: 'app-group-preview',
  templateUrl: './group-preview.component.html',
  styleUrls: [
    '../../common/css/preview.component.css', 
    './group-preview.component.css'
  ]
})
export class GroupPreviewComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @BlockUI() blockUI: NgBlockUI;
  
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

  updatable: boolean = false;
  removable: boolean = false;

  toggleSectionStyle: string = 'toggle-section deactivated';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private groupService: GroupService,
    private toastService: ToastService
  ) { }

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
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/groups/${this.group.id}`], 
      { state: { element: JSON.stringify(this.group) } });
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
    this.blockUI.start('Updating environment...');
    this.group.activated[this.selectedEnv] = event.checked;
    this.selectEnvironment(this.selectedEnv);

    this.groupService.setGroupEnvironmentStatus(this.group.id, this.selectedEnv, event.checked)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.group.activated = data.activated;
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

  private readPermissionToObject(): void {
    this.loadOperationSelectionComponent();

    const element = this.permissions.filter(p => p.id === this.group.id)[0];
    element.permissions.forEach(p => {
      if (p.action === 'UPDATE') {
        this.updatable = p.result === 'ok';

        if (!this.updatable) {
          this.environmentStatusSelection.disable({ onlySelf: true });
        } else {
          this.toggleSectionStyle = 'toggle-section';
        }
      } else if (p.action === 'DELETE') {
        this.removable = p.result === 'ok';
      }
    });
  }

}
