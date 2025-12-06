import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DetailComponent } from '../../common/detail-component';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { GroupService } from 'src/app/services/group.service';
import { AdminService } from 'src/app/services/admin.service';
import { Group } from 'src/app/model/group';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';
import { EnvironmentChangeEvent, EnvironmentConfigComponent } from '../../environment-config/environment-config.component';
import { BlockUIComponent } from '../../../../shared/block-ui/block-ui.component';
import { NgClass, NgStyle, DatePipe } from '@angular/common';
import { MatFormField, MatLabel, MatInput, MatError, MatHint } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ConfigListComponent } from '../../config/config-list/config-list.component';

@Component({
    selector: 'app-group-detail',
    templateUrl: './group-detail.component.html',
    styleUrls: [
        '../../common/css/detail.component.css',
        './group-detail.component.css'
    ],
    imports: [BlockUIComponent, NgClass, MatFormField, MatLabel, MatInput, FormsModule, NgStyle, 
      ReactiveFormsModule, MatError, MatHint, EnvironmentConfigComponent, MatButton, MatIcon, ConfigListComponent, DatePipe
    ]
})
export class GroupDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private readonly domainRouteService = inject(DomainRouteService);
  private readonly groupService = inject(GroupService);
  private readonly adminService = inject(AdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly _modalService = inject(NgbModal);

  private readonly unsubscribe = new Subject<void>();

  @ViewChild('descElement', { static: true }) 
  descElement: ElementRef;

  @ViewChild('nameElement', { static: true }) 
  nameElement: ElementRef;

  envEnable = new Subject<boolean>();

  domainId: string;
  domainName: string;
  groupId: string;
  group: Group;

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5)
  ]);

  constructor() { 
    super();
  }

  ngOnInit() {
    this.loading.set(true);

    this.route.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = params.name;
    });

    this.route.params.subscribe(params => {
      this.detailBodyStyle.set('detail-body loading');
      this.loading.set(true);
      this.groupId = params.groupid;
      
      const groupFromState = this.router.currentNavigation()?.extras.state?.element;
      if (groupFromState) {
        this.updateData(JSON.parse(groupFromState));
      } else {
        this.loadGroup();
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  edit() {
    if (!this.editing()) {
      this.classStatus.set('header editing');
      this.editing.set(true);
      return;
    }

    const { valid } = this.nameFormControl;

    if (valid) {
      this.setBlockUI(true, 'Saving changes...');
      this.classStatus.set(this.currentStatus() ? 'header activated' : 'header deactivated');

      const body = {
        name: this.nameElement.nativeElement.value,
        description: this.descElement.nativeElement.value
      };

      if (super.validateEdition(
          { name: this.group.name, description: this.group.description },
          { name: body.name, description: body.description })) {
        this.setBlockUI(false);
        this.editing.set(false);
        return;
      }

      this.editGroup(body);
    }
  }

  delete() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Group removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this group?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.setBlockUI(true, 'Removing group...');
        this.groupService.deleteGroup(this.group.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: () => {
              this.setBlockUI(false);
              this.router.navigate([this.domainRouteService.getPreviousPath()]);
              this.toastService.showSuccess(`Group removed with success`);
            },
            error: error => {
              this.setBlockUI(false);
              this.toastService.showError(`Unable to remove this group`);
              ConsoleLogger.printError(error);
            }
          });
      }
    });
  }

  onEnvChange($event: EnvironmentChangeEvent) {
    this.selectEnvironment($event);

    if ($event.reloadPermissions) {
      this.readPermissionToObject();
    }
  }

  private updateData(group: Group) {
    this.group = group;
    this.nameFormControl.setValue(this.group.name);
    this.readPermissionToObject();

    this.domainRouteService.updateView(this.group.name, 0);
    this.domainRouteService.updatePath(this.group.id, this.group.name, Types.GROUP_TYPE, 
      `/dashboard/domain/${this.domainName}/${this.domainId}/groups/${this.group.id}`);
  }

  private loadGroup() {
    this.groupService.getGroupById(this.groupId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: group => {
          if (group) {
            this.updateData(group);
          }
        },
        error: error => {
          this.toastService.showError(`Unable to load Group`);
          ConsoleLogger.printError(error);
        }
      });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['UPDATE', 'UPDATE_ENV_STATUS', 'DELETE'], 
      'GROUP', 'name', this.group.name, this.currentEnvironment())
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data.length) {
            this.updatable.set(data.find(permission => permission.action === 'UPDATE').result === 'ok');
            this.removable.set(data.find(permission => permission.action === 'DELETE').result === 'ok');
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
          this.loading.set(false);
          this.detailBodyStyle.set('detail-body ready');
        }
      });
  }

  private editGroup(body: { name: string; description: string; }) {
    this.groupService.updateGroup(this.group.id,
      body.name === this.group.name ? undefined : body.name,
      body.description === this.group.description ? undefined : body.description)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: data => {
            if (data) {
              this.group.name = body.name;
              this.group.description = body.description;
              
              this.setBlockUI(false);
              this.toastService.showSuccess(`Group updated with success`);
              this.editing.set(false);
            }
          },
          error: error => {
            this.setBlockUI(false);
            ConsoleLogger.printError(error);
            this.toastService.showError(`Unable to update group`);
            this.classStatus.set('header editing');
            this.editing.set(true);
          }
        });
  }

  public updateEnvironmentStatus(env: EnvironmentChangeEvent): void {
    this.setBlockUI(true, 'Updating environment...');
    this.selectEnvironment(env);
    this.groupService.setGroupEnvironmentStatus(this.group.id, env.environmentName, env.status)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.toastService.showSuccess(`Environment updated with success`);
          }
        },
        error: error => {
          this.setBlockUI(false);
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to update the environment '${env.environmentName}'`);
        },
        complete: () => this.setBlockUI(false)
      });
  }

  public removeEnvironmentStatus(env: any): void {
    this.setBlockUI(true, 'Removing environment status...');
    this.groupService.removeDomainEnvironmentStatus(this.group.id, env)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.setBlockUI(false);
            this.toastService.showSuccess(`Environment removed with success`);
          }
        },
        error: error => {
          this.setBlockUI(false);
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to remove the environment '${env}'`);
        }
      });
  }

}