import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Config } from 'protractor';
import { DashboardService } from '../../services/dashboard.service';
import { DomainRouteService } from '../services/domain-route.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Types } from '../model/path-route';

@Component({
  selector: 'app-config-list',
  templateUrl: './config-list.component.html',
  styleUrls: ['./config-list.component.css']
})
export class ConfigListComponent implements OnInit {
  configs$: Observable<Config[]>;

  constructor(
    private dashboardService: DashboardService,
    private domainRouteService : DomainRouteService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.configs$ = this.route.paramMap.pipe(
      switchMap(() => {
        return this.dashboardService.getConfigsByGroup(this.domainRouteService.getPathElement(Types.SELECTED_GROUP).id);
      })
    );
  }

}
