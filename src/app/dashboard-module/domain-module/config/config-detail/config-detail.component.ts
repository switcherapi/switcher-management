import { Component, OnInit, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-config-detail',
  templateUrl: './config-detail.component.html',
  styleUrls: ['./config-detail.component.css']
})
export class ConfigDetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  
  strategies:  Strategy[];
  loading = false;
  hasStrategies = false;
  error = '';

  constructor(
    private domainRouteService: DomainRouteService,
    private pathRoute: PathRoute,
    private route: ActivatedRoute,
    private configService: ConfigService,
    private errorHandler: RouterErrorHandler
  ) { }

  ngOnInit() {
    this.route.paramMap
    .pipe(takeUntil(this.unsubscribe), map(() => window.history.state)).subscribe(data => {
      if (data.element) {
        this.updatePathRoute(JSON.parse(data.element));
      } else {
        this.updatePathRoute(this.domainRouteService.getPathElement(Types.SELECTED_CONFIG).element);
      }
    })

    this.initStrategies();
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

  getConfig() {
    return this.pathRoute.element;
  }

  edit() {
    console.log(this.pathRoute.element.key)
  }

  private initStrategies() {
    this.loading = true;
    this.error = '';
    this.configService.getStrategiesByConfig(this.pathRoute.id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
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
