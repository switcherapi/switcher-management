import { Component, OnInit } from '@angular/core';
import { Group } from '../model/group';
import { DashboardService } from '../../services/dashboard.service';
import { DomainRouteService } from '../services/domain-route.service';
import { Types } from '../model/path-route';
import { environment } from 'src/environments/environment';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {
  groups$: Group[];
  loading = false;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private domainRouteService : DomainRouteService,
    private errorHandler: RouterErrorHandler
  ) { }

  ngOnInit() {
    this.loading = true;
    this.error = '';
    this.dashboardService.getGroupsByDomain(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id).subscribe(data => {
      if (data) {
        this.groups$ = data;
      }
      this.loading = false;
    }, error => {
      this.error = this.errorHandler.doError(error);
      this.loading = false;
    });

    setTimeout(() => {
      if (!this.groups$) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    }, environment.timeout);
  }

}
