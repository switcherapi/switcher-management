import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DetailComponent } from '../../common/detail-component';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { GroupService } from 'src/app/services/group.service';
import { AdminService } from 'src/app/services/admin.service';
import { Group } from 'src/app/model/group';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';
import { EnvironmentChangeEvent } from '../../environment-config/environment-config.component';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: [
    '../../common/css/detail.component.css', 
    './group-detail.component.css'
  ]
})
export class GroupDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @BlockUI() blockUI: NgBlockUI;

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

  constructor(
    private domainRouteService: DomainRouteService,
    private groupService: GroupService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private _modalService: NgbModal
  ) { 
    super();
  }

  ngOnInit() {
    this.loading = true;

    this.route.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = params.name;
    });

    this.route.params.subscribe(params => {
      this.groupId = params.groupid;
      this.loadGroup();
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  edit() {
    if (!this.editing) {
      this.classStatus = 'header editing';
      this.editing = true;
    } else {
      const { valid } = this.nameFormControl;

      if (valid) {
        this.blockUI.start('Saving changes...');
        this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';

        const body = {
          name: this.nameElement.nativeElement.value,
          description: this.descElement.nativeElement.value
        };

        if (super.validateEdition(
            { name: this.group.name, description: this.group.description },
            { name: body.name, description: body.description })) {
          this.blockUI.stop();
          this.editing = false;
          return;
        }

        this.editGroup(body);
      }
    }
  }

  delete() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Group removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this group?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.blockUI.start('Removing group...');
        this.groupService.deleteGroup(this.group.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: _data => {
              this.blockUI.stop();
              this.router.navigate([this.domainRouteService.getPreviousPath()]);
              this.toastService.showSuccess(`Group removed with success`);
            },
            error: error => {
              this.blockUI.stop();
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
      'GROUP', 'name', this.group.name, this.currentEnvironment)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data.length) {
            this.updatable = data.find(permission => permission.action === 'UPDATE').result === 'ok';
            this.removable = data.find(permission => permission.action === 'DELETE').result === 'ok';
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
          this.loading = false;
          this.detailBodyStyle = 'detail-body ready';
        }
      });
  }

  private editGroup(body: { name: string; description: string; }) {
    this.groupService.updateGroup(this.group.id,
      body.name != this.group.name ? body.name : undefined,
      body.description != this.group.description ? body.description : undefined)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: data => {
            if (data) {
              this.group.name = body.name;
              this.group.description = body.description;
              
              this.blockUI.stop();
              this.toastService.showSuccess(`Group updated with success`);
              this.editing = false;
            }
          },
          error: error => {
            this.blockUI.stop();
            ConsoleLogger.printError(error);
            this.toastService.showError(`Unable to update group`);
            this.classStatus = 'header editing';
            this.editing = true;
          }
        });
  }

  public updateEnvironmentStatus(env: EnvironmentChangeEvent): void {
    this.blockUI.start('Updating environment...');
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
          this.blockUI.stop();
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to update the environment '${env.environmentName}'`);
        },
        complete: () => this.blockUI.stop()
      });
  }

  public removeEnvironmentStatus(env: any): void {
    this.blockUI.start('Removing environment status...');
    this.groupService.removeDomainEnvironmentStatus(this.group.id, env)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.blockUI.stop();
            this.toastService.showSuccess(`Environment removed with success`);
          }
        },
        error: error => {
          this.blockUI.stop();
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to remove the environment '${env}'`);
        }
      });
  }

}