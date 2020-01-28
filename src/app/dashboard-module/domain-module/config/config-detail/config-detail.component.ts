import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DomainRouteService } from '../../../services/domain-route.service';
import { PathRoute, Types } from '../../model/path-route';
import { Config } from '../../model/config';
import { ActivatedRoute, Router } from '@angular/router';
import { map, takeUntil } from 'rxjs/operators';
import { Strategy } from '../../model/strategy';
import { Subject } from 'rxjs';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { environment } from 'src/environments/environment';
import { ConfigService } from 'src/app/dashboard-module/services/config.service';
import { StrategyService } from 'src/app/dashboard-module/services/strategy.service';
import { AdminService } from 'src/app/dashboard-module/services/admin.service';
import { DetailComponent } from '../../common/detail-component';
import { EnvironmentConfigComponent } from '../../environment-config/environment-config.component';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirm } from 'src/app/_helpers/confirmation-dialog';
import { StrategyCreateComponent } from '../strategy-create/strategy-create.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-config-detail',
  templateUrl: './config-detail.component.html',
  styleUrls: [
    '../../common/css/detail.component.css', 
    './config-detail.component.css'
  ]
})
export class ConfigDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @ViewChild('envSelectionChange', { static: true })
  private envSelectionChange: EnvironmentConfigComponent;

  @ViewChild('descElement', { static: true }) 
  descElement: ElementRef;

  @ViewChild('keyElement', { static: true }) 
  keyElement: ElementRef;

  keyFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5)
  ]);

  classStatus: string;
  
  strategies:  Strategy[];
  loading = false;
  hasStrategies = false;
  hasNewStrategy = false;
  error = '';

  constructor(
    private domainRouteService: DomainRouteService,
    private pathRoute: PathRoute,
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private adminService: AdminService,
    private strategyService: StrategyService,
    private errorHandler: RouterErrorHandler,
    private toastService: ToastService,
    private _modalService: NgbModal,
    private dialog: MatDialog
  ) { 
    super(adminService);
  }

  ngOnInit() {
    this.hasNewStrategy = false;
    this.route.paramMap
    .pipe(takeUntil(this.unsubscribe), map(() => window.history.state)).subscribe(data => {
      if (data.element) {
        this.updatePathRoute(JSON.parse(data.element));
      } else {
        this.updatePathRoute(this.domainRouteService.getPathElement(Types.SELECTED_CONFIG).element);
      }
    })

    this.envSelectionChange.outputEnvChanged.pipe(takeUntil(this.unsubscribe)).subscribe(status => {
      this.selectEnvironment(status);
      this.initStrategies();
    });

    this.envSelectionChange.outputStatusChanged.pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.updateEnvironmentStatus(env);
    });

    super.loadAdmin(this.getConfig().owner);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  updatePathRoute(config: Config) {
    this.pathRoute = {
      id: config.id,
      element: config,
      name: config.key,
      path: '/dashboard/domain/group/switcher/detail',
      type: Types.CONFIG_TYPE
    };

    this.domainRouteService.updatePath(this.pathRoute, true);
  }

  updateEnvironmentStatus(env : any): void {
    this.selectEnvironment(env.status);
    this.configService.setConfigEnvironmentStatus(this.getConfig().id, env.environment, env.status).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.updatePathRoute(data);
        this.toastService.showSuccess(`Environment updated with success`);
      }
    }, error => {
      this.toastService.showError(`Unable to update the environment '${env.environment}'`);
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

  getConfig() {
    return this.pathRoute.element;
  }

  edit() {
    if (!this.editing) {
      this.classStatus = 'header editing';
      this.editing = true;
    } else {
      const { valid } = this.keyFormControl;

      if (valid) {
        this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';

        const body = {
          key: this.keyElement.nativeElement.value,
          description: this.descElement.nativeElement.value
        };

        this.configService.updateConfig(this.getConfig().id, body.key, body.description).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          if (data) {
            this.updatePathRoute(data);
            this.toastService.showSuccess(`Switcher updated with success`);
            this.editing = false
          }
        }, error => {
          console.log(error)
          this.toastService.showError(`Unable to update switcher`);
          this.classStatus = 'header editing';
          this.editing = true;
        });
      }
    }
  }

  delete() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Switcher removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this switcher?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.configService.deleteConfig(this.getConfig().id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          this.domainRouteService.removePath(Types.CONFIG_TYPE);
          this.router.navigate(['/dashboard/domain/group/switchers']);
          this.toastService.showSuccess(`Switcher removed with success`);
        }, error => {
          this.toastService.showError(`Unable to remove this switcher`);
          console.log(error);
        });
      }
    });
  }

  addStrategy() {
    const dialogRef = this.dialog.open(StrategyCreateComponent, {
      width: '700px',
      data: {
        currentStrategies: this.strategies
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe)).subscribe(result => {
      if (result) {
        this.hasNewStrategy = true;
          this.strategyService.createStrategy(
            this.getConfig().id, 
            result.description, 
            result.strategy, 
            result.operation, 
            this.envSelectionChange.selectedEnvName, 
            result.values).subscribe(data => {
              this.initStrategies();
              this.toastService.showSuccess(`Strategy created with success`);
            }, error => {
              this.toastService.showError(error.error);
              console.log(error);
            });
      }
    });
  }

  private initStrategies() {
    this.loading = true;
    this.error = '';
    this.strategyService.getStrategiesByConfig(this.pathRoute.id, this.envSelectionChange.selectedEnvName).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.hasStrategies = data.length > 0;
        this.strategies = data;
      }
      this.loading = false;
    }, error => {
      this.error = this.errorHandler.doError(error);
      this.loading = false;
    });

    setTimeout(() => {
      if (!this.strategies) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    }, environment.timeout);
  }

}