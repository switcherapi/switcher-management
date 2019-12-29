import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from '../domain/domain-route.service';
import { PathRoute } from '../domain/path-route';
import { ActivatedRoute } from '@angular/router';
import { Domain } from '../../model/domain';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-domain-detail',
  templateUrl: './domain-detail.component.html',
  styleUrls: ['./domain-detail.component.css']
})
export class DomainDetailComponent implements OnInit {

  constructor(
    private domainRouteService: DomainRouteService,
    private pathRoute: PathRoute,
    private route: ActivatedRoute,
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.dashboardService.getDomain(params.id).subscribe(domain => {
        this.updatePathRoute(domain);
      })
    });
  }

  updatePathRoute(domain: Domain) {
    this.pathRoute = {
      id: domain.id,
      name: domain.name,
      path: '/dashboard/domain/',
      type: 'Domain'
    };

    this.domainRouteService.updatePath(this.pathRoute);
  }

}
