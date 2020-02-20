import { Component, OnInit, OnDestroy } from '@angular/core';
import { Config } from 'protractor';
import { DomainRouteService } from '../../../services/domain-route.service';
import { Types } from '../../model/path-route';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from 'src/app/dashboard-module/services/config.service';
import { FormBuilder } from '@angular/forms';
import { EnvironmentService } from 'src/app/dashboard-module/services/environment.service';
import { ListComponent } from '../../common/list-component';
import { MatDialog } from '@angular/material';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConfigCreateComponent } from '../config-create/config-create.component';
import { AdminService } from 'src/app/dashboard-module/services/admin.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';

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
    private fb: FormBuilder,
    private dialog: MatDialog,
    private adminService: AdminService,
    private configService: ConfigService,
    private domainRouteService : DomainRouteService,
    private environmentService: EnvironmentService,
    private toastService: ToastService,
    private errorHandler: RouterErrorHandler
  ) { 
    super(fb, environmentService, domainRouteService);
  }

  ngOnInit() {
    this.cardListContainerStyle = 'card mt-4 loading';
    this.loading = true;
    this.error = '';
    this.readPermissionToObject();
    this.configService.getConfigsByGroup(
      this.domainRouteService.getPathElement(Types.SELECTED_GROUP).id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
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

  ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  createConfig(): void {
    const dialogRef = this.dialog.open(ConfigCreateComponent, {
      width: '400px',
      data: { key: '',  description: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.configService.createConfig(this.domainRouteService.getPathElement(Types.SELECTED_GROUP).id, result.key, result.description)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(data => {
          if (data) {
            this.ngOnInit();
          }
        }, error => {
          this.toastService.showError('Unable to create a new switcher.');
          ConsoleLogger.printError(error);
        });
      }
    });
  }

  readPermissionToObject(): void {
    const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.adminService.readCollabPermission(domain.id, ['CREATE'], 'SWITCHER', 'name', domain.name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'CREATE') {
            this.creatable = element.result === 'ok' ? true : false;
          }
        });
      }
    });
  }

}
