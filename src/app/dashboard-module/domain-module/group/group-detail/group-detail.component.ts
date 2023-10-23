import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
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
import { FeatureService } from 'src/app/services/feature.service';

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

  featureDetailsv2 = false;

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5)
  ]);

  constructor(
    private domainRouteService: DomainRouteService,
    private groupService: GroupService,
    private adminService: AdminService,
    private featureService: FeatureService,
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

      this.featureDetailsv2 = false;
      this.featureService.isEnabled({ feature: 'DETAIL_V2' })
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(data => this.featureDetailsv2 = data?.status);
    });

    this.route.paramMap.pipe(map(() => window.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.element) {
          this.updateData(JSON.parse(data.element));
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
          .subscribe(_data => {
            this.blockUI.stop();
            this.router.navigate([this.domainRouteService.getPreviousPath()]);
            this.toastService.showSuccess(`Group removed with success`);
        }, error => {
          this.blockUI.stop();
          this.toastService.showError(`Unable to remove this group`);
          ConsoleLogger.printError(error);
        });
      }
    });
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
      .subscribe(group => {
        if (group) {
          this.updateData(group);
        }
    }, error => {
      this.toastService.showError(`Unable to load Group`);
      ConsoleLogger.printError(error);
    });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['UPDATE', 'DELETE'], 'GROUP', 'name', this.group.name)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          data.forEach(element => {
            if (element.action === 'UPDATE') {
              this.updatable = element.result === 'ok';
              this.envEnable.next(!this.updatable);
            } else if (element.action === 'DELETE') {
              this.removable = element.result === 'ok';
            }
          });
        }
    }, error => {
      ConsoleLogger.printError(error);
    }, () => {
      this.loading = false;
      this.detailBodyStyle = 'detail-body ready';
    });
  }

  private editGroup(body: { name: string; description: string; }) {
    this.groupService.updateGroup(this.group.id,
      body.name != this.group.name ? body.name : undefined,
      body.description != this.group.description ? body.description : undefined)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(data => {
          if (data) {
            this.group.name = body.name;
            this.group.description = body.description;
            
            this.blockUI.stop();
            this.toastService.showSuccess(`Group updated with success`);
            this.editing = false;
          }
      }, error => {
        this.blockUI.stop();
        ConsoleLogger.printError(error);
        this.toastService.showError(`Unable to update group`);
        this.classStatus = 'header editing';
        this.editing = true;
      });
  }

  public updateEnvironmentStatus(env: EnvironmentChangeEvent): void {
    this.blockUI.start('Updating environment...');
    this.selectEnvironment(env);
    this.groupService.setGroupEnvironmentStatus(this.group.id, env.environmentName, env.status)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.selectEnvironment(env);
          this.toastService.showSuccess(`Environment updated with success`);
        }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to update the environment '${env.environmentName}'`);
    }, () => this.blockUI.stop());
  }

  public removeEnvironmentStatus(env: any): void {
    this.blockUI.start('Removing environment status...');
    this.groupService.removeDomainEnvironmentStatus(this.group.id, env)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.blockUI.stop();
          this.toastService.showSuccess(`Environment removed with success`);
        }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to remove the environment '${env}'`);
    });
  }

}