import { Component, OnInit } from '@angular/core';
import { Group } from '../model/group';
import { DashboardService } from '../../services/dashboard.service';
import { DomainRouteService } from '../services/domain-route.service';
import { Types } from '../model/path-route';

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
    private domainRouteService : DomainRouteService
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
      this.error = error;
      this.loading = false;
    });
  }

}
