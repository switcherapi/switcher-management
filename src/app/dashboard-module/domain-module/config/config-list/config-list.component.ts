import { Component, OnInit, OnDestroy } from '@angular/core';
import { Config } from 'protractor';
import { DomainRouteService } from '../../../services/domain-route.service';
import { Types } from '../../model/path-route';
import { environment } from 'src/environments/environment';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from 'src/app/dashboard-module/services/config.service';

@Component({
  selector: 'app-config-list',
  templateUrl: './config-list.component.html',
  styleUrls: ['./config-list.component.css']
})
export class ConfigListComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  configs$: Config[];
  loading = false;
  error = '';

  constructor(
    private configService: ConfigService,
    private domainRouteService : DomainRouteService,
    private errorHandler: RouterErrorHandler
  ) { }

  ngOnInit() {
    this.loading = true;
    this.error = '';
    this.configService.getConfigsByGroup(
      this.domainRouteService.getPathElement(Types.SELECTED_GROUP).id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        
      if (data) {
        this.configs$ = data;
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

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
