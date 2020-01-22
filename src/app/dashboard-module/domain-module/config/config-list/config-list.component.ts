import { Component, OnInit, OnDestroy } from '@angular/core';
import { Config } from 'protractor';
import { DomainRouteService } from '../../../services/domain-route.service';
import { Types } from '../../model/path-route';
import { environment } from 'src/environments/environment';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from 'src/app/dashboard-module/services/config.service';
import { FormBuilder } from '@angular/forms';
import { EnvironmentService } from 'src/app/dashboard-module/services/environment.service';
import { ListComponent } from '../../common/list-component';
import { MatDialog } from '@angular/material';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConfigCreateComponent } from '../config-create/config-create.component';

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

  configs$: Config[];
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private configService: ConfigService,
    private domainRouteService : DomainRouteService,
    private environmentService: EnvironmentService,
    private errorHandler: RouterErrorHandler,
    private toastService: ToastService
  ) { 
    super(fb, environmentService, domainRouteService);
  }

  ngOnInit() {
    this.loading = true;
    this.error = '';
    this.configService.getConfigsByGroup(
      this.domainRouteService.getPathElement(Types.SELECTED_GROUP).id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        
      if (data) {
        this.configs$ = data;
        super.loadEnvironments();
      }
      this.loading = false;
    }, error => {
      this.error = this.errorHandler.doError(error);
      this.loading = false;
    });

    setTimeout(() => {
      if (!this.configs$) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    }, environment.timeout);
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
        this.configService.createConfig(this.domainRouteService.getPathElement(Types.SELECTED_GROUP).id, result.key, result.description).subscribe(data => {
          if (data) {
            this.ngOnInit();
          }
        }, error => {
          this.toastService.showError('Unable to create a new switcher.');
          console.log(error);
        });
      }
    });
  }

}
