import { Component, OnInit, Input, OnDestroy, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AdminService } from 'src/app/services/admin.service';
import { ConfigService } from 'src/app/services/config.service';
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

  @Input() domainId: string;
  @Input() domainName: string;
  @Input() groupId: string;
  @Input() config: Config;
  @Input() environmentSelectionChange: EventEmitter<string>;

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
    private configService: ConfigService,
    private toastService: ToastService
  ) { }

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
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/groups/${this.groupId}/switchers/${this.config.id}`], 
      { state: { element: JSON.stringify(this.config) } });
  }

  updateEnvironmentStatus(event: MatSlideToggleChange) {
    this.blockUI.start('Updating environment...');
    this.config.activated[this.selectedEnv] = event.checked;
    this.selectEnvironment(this.selectedEnv);

    this.configService.setConfigEnvironmentStatus(this.config.id, this.selectedEnv, event.checked)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.config = data;
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

  private selectEnvironment(envName: string): void {
    this.selectedEnv = envName;
    const status = this.config.activated[envName] == undefined ? this.config.activated['default'] : this.config.activated[envName];

    this.classStatus = status ? 'grid-container activated' : 'grid-container deactivated';
    this.classBtnStatus = status ? 'header-section activated' : 'header-section deactivated';

    this.environmentStatusSelection.get('environmentStatusSelection').setValue(status);
    this.selectedEnvStatus = status;
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['UPDATE', 'DELETE'], 'SWITCHER', 'name', this.config.key)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
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
