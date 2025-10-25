import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListComponent } from '../../common/list-component';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConfigCreateComponent } from '../config-create/config-create.component';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from 'src/app/services/admin.service';
import { ConfigService } from 'src/app/services/config.service';
import { EnvironmentService } from 'src/app/services/environment.service';
import { Config } from 'src/app/model/config';
import { ActivatedRoute } from '@angular/router';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { GroupService } from 'src/app/services/group.service';
import { Types } from 'src/app/model/path-route';
import { PermissionService } from 'src/app/services/permission.service';
import { Permissions } from 'src/app/model/permission';
import { EnvironmentChangeEvent } from '../../environment-config/environment-config.component';
import { NgClass } from '@angular/common';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { ConfigPreviewComponent } from '../config-preview/config-preview.component';

@Component({
    selector: 'app-config-list',
    templateUrl: './config-list.component.html',
    styleUrls: [
        '../../common/css/list.component.css',
        './config-list.component.css'
    ],
    imports: [NgClass, MatButton, MatIcon, FormsModule, ReactiveFormsModule, MatFormField, 
      MatLabel, MatSelect, MatOption, ConfigPreviewComponent, MatMiniFabButton
    ]
})
export class ConfigListComponent extends ListComponent implements OnInit, OnDestroy {
  protected fb: FormBuilder;
  protected route: ActivatedRoute;
  protected environmentService: EnvironmentService;
  private readonly domainRouteService = inject(DomainRouteService);
  private readonly dialog = inject(MatDialog);
  private readonly adminService = inject(AdminService);
  private readonly configService = inject(ConfigService);
  private readonly groupService = inject(GroupService);
  private readonly permissionService = inject(PermissionService);
  private readonly toastService = inject(ToastService);
  private readonly errorHandler = inject(RouterErrorHandler);

  permissions: Permissions[];
  configs: Config[];

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
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  createConfig(): void {
    const dialogRef = this.dialog.open(ConfigCreateComponent, {
      width: '400px',
      minWidth: globalThis.innerWidth < 450 ? '95vw' : '',
      data: { key: '',  description: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.configService.createConfig(this.groupId, result.key.toUpperCase(), result.description)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: data => {
              if (data) {
                this.ngOnInit();
              }
            },
            error: error => {
              this.ngOnInit();
              this.toastService.showError(`Unable to create a new switcher. ${error.error}`);
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

  private loadConfigs(environmentName: string) {
    this.configService.getConfigsByGroup(this.groupId, this.skip, 'id,key,activated')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.configs = data;
            super.loadEnvironments(environmentName);
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.loading = false;
          this.error = this.errorHandler.doError(error);
        },
        complete: () => {
          if (!this.configs) {
            this.error = 'Failed to connect to Switcher API';
          }
          this.loading = false;
        }
      });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['CREATE'], 'SWITCHER')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          this.creatable = data.find(permission => permission.action === 'CREATE').result === 'ok';
        }
    });
  }

  private readChildPermissions(environmentName: string): void {
    this.permissionService.executePermissionQuery(this.domainId, this.groupId, 'SWITCHER', ['UPDATE', 'UPDATE_ENV_STATUS', 'DELETE'], environmentName)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(response => {
        if (response.data.permission.length) {
          this.permissions = response.data.permission;
        }

        this.loadConfigs(environmentName);
        this.loadGroup();
      });
  }

  private loadGroup(): void {
    this.groupService.getGroupById(this.groupId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.domainRouteService.updateView(data.name, 0);
            this.domainRouteService.updatePath(data.id, data.name, Types.GROUP_TYPE, 
              `/dashboard/domain/${this.domainName}/${this.domainId}/groups/${data.id}`);
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
        }
      });
  }

}
