import { Component, OnInit } from '@angular/core';
import { Config } from 'protractor';
import { DashboardService } from '../../services/dashboard.service';
import { DomainRouteService } from '../services/domain-route.service';
import { Types } from '../model/path-route';

@Component({
  selector: 'app-config-list',
  templateUrl: './config-list.component.html',
  styleUrls: ['./config-list.component.css']
})
export class ConfigListComponent implements OnInit {
  configs$: Config[];
  loading = false;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private domainRouteService : DomainRouteService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.error = '';
    this.dashboardService.getConfigsByGroup(this.domainRouteService.getPathElement(Types.SELECTED_GROUP).id).subscribe(data => {
      if (data) {
        this.configs$ = data;
      }
      this.loading = false;
    }, error => {
      this.error = error;
      this.loading = false;
    });
  }

}
