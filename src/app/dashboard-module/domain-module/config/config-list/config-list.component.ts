import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
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

@Component({
  selector: 'app-config-list',
  templateUrl: './config-list.component.html',
  styleUrls: [
    '../../common/css/list.component.css', 
    './config-list.component.css'
  ]
})
export class ConfigListComponent extends ListComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  configs: Config[];
  loading = false;
  error = '';

  creatable: boolean = false;

  constructor(
    protected fb: FormBuilder,
    protected route: ActivatedRoute,
    protected environmentService: EnvironmentService,
    private domainRouteService: DomainRouteService,
    private dialog: MatDialog,
    private adminService: AdminService,
    private configService: ConfigService,
    private groupService: GroupService,
    private toastService: ToastService,
    private errorHandler: RouterErrorHandler
  ) { 
    super(route, fb, environmentService);
  }

  ngOnInit() {
    this.cardListContainerStyle = 'card mt-4 loading';
    this.loading = true;
    this.error = '';

    this.readPermissionToObject();
    this.loadConfigs();
    this.loadGroup();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  createConfig(): void {
    const dialogRef = this.dialog.open(ConfigCreateComponent, {
      width: '400px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: { key: '',  description: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.configService.createConfig(this.groupId, result.key, result.description)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(data => {
            if (data) {
              this.ngOnInit();
            }
        }, error => {
          this.ngOnInit();
          this.toastService.showError(`Unable to create a new switcher. ${error.error}`);
          ConsoleLogger.printError(error);
        });
      }
    });
  }

  private loadConfigs() {
    this.configService.getConfigsByGroup(this.groupId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.configs = data;
          super.loadEnvironments();
        }
    }, error => {
      ConsoleLogger.printError(error);
      this.loading = false;
      this.error = this.errorHandler.doError(error);
    }, () => {
      if (!this.configs) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['CREATE'], 'SWITCHER', 'name', this.domainName)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          data.forEach(element => {
            if (element.action === 'CREATE') {
              this.creatable = element.result === 'ok';
            }
          });
        }
    });
  }

  private loadGroup(): void {
    this.groupService.getGroupById(this.groupId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.domainRouteService.updateView(data.name, 0);
        }
    }, error => {
      ConsoleLogger.printError(error);
    });
  }

}
