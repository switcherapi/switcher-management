import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DomainRouteService } from '../../../services/domain-route.service';
import { PathRoute, Types } from '../../model/path-route';
import { Config } from '../../model/config';
import { ActivatedRoute } from '@angular/router';
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

@Component({
  selector: 'app-config-detail',
  templateUrl: './config-detail.component.html',
  styleUrls: ['./config-detail.component.css']
})
export class ConfigDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @ViewChild('envSelectionChange', { static: true })
  private envSelectionChange: EnvironmentConfigComponent;

  classStatus: string;
  
  strategies:  Strategy[];
  loading = false;
  hasStrategies = false;
  error = '';

  constructor(
    private domainRouteService: DomainRouteService,
    private pathRoute: PathRoute,
    private route: ActivatedRoute,
    private configService: ConfigService,
    private adminService: AdminService,
    private strategyService: StrategyService,
    private errorHandler: RouterErrorHandler
  ) { 
    super(adminService);
  }

  ngOnInit() {
    this.route.paramMap
    .pipe(takeUntil(this.unsubscribe), map(() => window.history.state)).subscribe(data => {
      if (data.element) {
        this.updatePathRoute(JSON.parse(data.element));
      } else {
        this.updatePathRoute(this.domainRouteService.getPathElement(Types.SELECTED_CONFIG).element);
      }
    })

    this.envSelectionChange.statusChanged.pipe(takeUntil(this.unsubscribe)).subscribe(status => {
      this.updateStatus(status);
    });

    this.initStrategies();
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

    this.domainRouteService.updatePath(this.pathRoute);
  }

  updateStatus(status: boolean): void {
    this.classStatus = status ? 'header activated' : 'header deactivated';
  }

  getConfig() {
    return this.pathRoute.element;
  }

  edit() {
    console.log(this.pathRoute.element.key)
  }

  private initStrategies() {
    this.loading = true;
    this.error = '';
    this.strategyService.getStrategiesByConfig(this.pathRoute.id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
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
