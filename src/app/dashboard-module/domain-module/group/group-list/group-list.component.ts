import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { ListComponent } from '../../common/list-component';
import { GroupCreateComponent } from '../group-create/group-create.component';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { MatDialog } from '@angular/material/dialog';
import { Group } from 'src/app/model/group';
import { AdminService } from 'src/app/services/admin.service';
import { GroupService } from 'src/app/services/group.service';
import { EnvironmentService } from 'src/app/services/environment.service';
import { ActivatedRoute } from '@angular/router';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';
import { PermissionService } from 'src/app/services/permission.service';
import { Permissions } from 'src/app/model/permission';
import { EnvironmentChangeEvent } from '../../environment-config/environment-config.component';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: [
    '../../common/css/list.component.css', 
    './group-list.component.css'
  ],
  standalone: false
})
export class GroupListComponent extends ListComponent implements OnInit, OnDestroy {
  protected fb: FormBuilder;
  protected route: ActivatedRoute;
  protected environmentService: EnvironmentService;
  private readonly dialog = inject(MatDialog);
  private readonly domainRouteService = inject(DomainRouteService);
  private readonly adminService = inject(AdminService);
  private readonly groupService = inject(GroupService);
  private readonly permissionService = inject(PermissionService);
  private readonly toastService = inject(ToastService);
  private readonly errorHandler = inject(RouterErrorHandler);

  permissions: Permissions[];
  groups: Group[];

  creatable = false;

  constructor() {
    const fb = inject(FormBuilder);
    const route = inject(ActivatedRoute);
    const environmentService = inject(EnvironmentService);

    super();
  
    this.fb = fb;
    this.route = route;
    this.environmentService = environmentService;
  }

  ngOnInit() {
    this.cardListContainerStyle = 'card mt-4 loading';
    this.loading = true;
    this.error = '';

    this.readPermissionToObject();
    this.readChildPermissions(this.environmentSelection.get('environmentSelection').value ?? 'default');
    this.updateData();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  createGroup(): void {
    const dialogRef = this.dialog.open(GroupCreateComponent, {
      width: '400px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: { name: '',  description: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.groupService.createGroup(this.domainId, result.name, result.description)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: data => {
              if (data) {
                this.ngOnInit();
              }
            },
            error: error => {
              this.ngOnInit();
              this.toastService.showError(`Unable to create a new group. ${error.error}`);
              ConsoleLogger.printError(error);
            }
          });
      }
    });
  }

  onNext(): void {
    this.skip += 10;
    this.ngOnInit();
  }

  onPrevious(): void {
    this.skip -= 10;
    this.ngOnInit();
  }

  protected onEnvChange($event: EnvironmentChangeEvent) {
    this.loading = true;
    this.environmentSelectionChange.emit($event.environmentName);
    this.readChildPermissions($event.environmentName);
  }

  private updateData() {
    this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
      `/dashboard/domain/${this.domainName}/${this.domainId}`);
  }

  private loadGroups(environmentName: string) {
    this.groupService.getGroupsByDomain(this.domainId, this.skip, 'id,name,activated,admin')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.groups = data;
            super.loadEnvironments(environmentName);
            this.domainRouteService.updateView(decodeURIComponent(this.domainName), 0);
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.loading = false;
          this.error = this.errorHandler.doError(error);
        },
        complete: () => {
          if (!this.groups) {
            this.error = 'Failed to connect to Switcher API';
          }
          this.loading = false;
        }
      });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['CREATE'], 'GROUP')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          this.creatable = data.find(permission => permission.action === 'CREATE').result === 'ok';
        }
    });
  }

  private readChildPermissions(environmentName: string): void {
    this.permissionService.executePermissionQuery(this.domainId, this.domainId, 'GROUP', ['UPDATE', 'UPDATE_ENV_STATUS', 'DELETE'], environmentName)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(response => {
        if (response.data.permission.length) {
          this.permissions = response.data.permission;
        }

        this.loadGroups(environmentName);
      });
  }

}
