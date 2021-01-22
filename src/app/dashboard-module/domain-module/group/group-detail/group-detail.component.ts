import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DetailComponent } from '../../common/detail-component';
import { EnvironmentConfigComponent } from '../../environment-config/environment-config.component';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirm } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { GroupService } from 'src/app/services/group.service';
import { AdminService } from 'src/app/services/admin.service';
import { PathRoute, Types } from 'src/app/model/path-route';
import { Group } from 'src/app/model/group';

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

  @ViewChild('envSelectionChange', { static: true })
  private envSelectionChange: EnvironmentConfigComponent;

  @ViewChild('descElement', { static: true }) 
  descElement: ElementRef;

  @ViewChild('nameElement', { static: true }) 
  nameElement: ElementRef;

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5)
  ]);

  constructor(
    private domainRouteService: DomainRouteService,
    private groupService: GroupService,
    private adminService: AdminService,
    private pathRoute: PathRoute,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private _modalService: NgbModal
  ) { 
    super(adminService);
  }

  ngOnInit() {
    this.loading = true;
    this.route.paramMap
      .pipe(takeUntil(this.unsubscribe), map(() => window.history.state)).subscribe(data => {
        if (data.element) {
          this.updatePathRoute(JSON.parse(data.element));
        } else {
          this.updatePathRoute(this.domainRouteService.getPathElement(Types.SELECTED_GROUP).element);
        }
      });

    this.envSelectionChange.outputEnvChanged.pipe(takeUntil(this.unsubscribe)).subscribe(status => {
      this.selectEnvironment(status);
    });

    this.envSelectionChange.outputStatusChanged.pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.updateEnvironmentStatus(env);
    });

    this.envSelectionChange.outputEnvRemoved.pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.removeEnvironmentStatus(env);
    });

    super.loadAdmin(this.getGroup().owner);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  updatePathRoute(group: Group) {
    this.pathRoute = {
      id: group.id,
      element: group,
      name: group.name,
      path: '/dashboard/domain/group/detail',
      type: Types.GROUP_TYPE
    };

    this.nameFormControl.setValue(group.name);
    this.domainRouteService.updatePath(this.pathRoute, true);
    this.readPermissionToObject();
  }

  updateEnvironmentStatus(env : any): void {
    this.blockUI.start('Updating environment...');
    this.selectEnvironment(env.status);
    this.groupService.setGroupEnvironmentStatus(this.getGroup().id, env.environment, env.status).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.selectEnvironment(env.status);
        this.updatePathRoute(data);
        this.toastService.showSuccess(`Environment updated with success`);
      }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to update the environment '${env.environment}'`);
    }, () => this.blockUI.stop());
  }

  removeEnvironmentStatus(env : any): void {
    this.blockUI.start('Removing environment status...');
    this.groupService.removeDomainEnvironmentStatus(this.getGroup().id, env).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.blockUI.stop();
        this.updatePathRoute(data);
        this.toastService.showSuccess(`Environment removed with success`);
      }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to remove the environment '${env}'`);
    });
  }

  selectEnvironment(status: boolean): void {
    this.currentStatus = status;

    if (this.editing) {
      this.classStatus = 'header editing';
    } else {
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
    }
  }

  getGroup() {
    return this.pathRoute.element;
  }

  readPermissionToObject(): void {
    const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.adminService.readCollabPermission(domain.id, ['UPDATE', 'DELETE'], 'GROUP', 'name', this.getGroup().name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'UPDATE') {
            this.updatable = element.result === 'ok' ? true : false;
            this.envSelectionChange.disableEnvChange(!this.updatable);
          } else if (element.action === 'DELETE') {
            this.removable = element.result === 'ok' ? true : false;
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
            { name: this.pathRoute.name, description: this.pathRoute.element.description },
            { name: body.name, description: body.description })) {
          this.blockUI.stop();
          this.editing = false;
          return;
        }

        this.groupService.updateGroup(this.getGroup().id, 
          body.name != this.pathRoute.name ? body.name : undefined, 
          body.description != this.pathRoute.element.description ? body.description : undefined).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          if (data) {
            this.updatePathRoute(data);
            this.domainRouteService.notifyDocumentChange();
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
    }
  }
  
  delete() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Group removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this group?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.blockUI.start('Removing group...');
        this.groupService.deleteGroup(this.getGroup().id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          this.blockUI.stop();
          this.domainRouteService.removePath(Types.GROUP_TYPE);
          this.domainRouteService.notifyDocumentChange();
          this.router.navigate(['/dashboard/domain/group']);
          this.toastService.showSuccess(`Group removed with success`);
        }, error => {
          this.blockUI.stop();
          this.toastService.showError(`Unable to remove this group`);
          ConsoleLogger.printError(error);
        });
      }
    });
  }

}