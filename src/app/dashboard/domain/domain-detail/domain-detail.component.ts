import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from '../domain-route/domain-route.service';
import { PathRoute } from '../domain-route/path-route';

@Component({
  selector: 'app-domain-detail',
  templateUrl: './domain-detail.component.html',
  styleUrls: ['./domain-detail.component.css']
})
export class DomainDetailComponent implements OnInit {

  constructor(
    private domainRouteService: DomainRouteService,
    private pathRoute: PathRoute
  ) { }

  ngOnInit() {
    this.updatePathRoute();
  }

  updatePathRoute() {
    this.domainRouteService.clearPath();
    
    this.pathRoute = {
      id: '1',
      name: 'Domain Name',
      path: '/dashboard/domain',
      type: 'Domain'
    };

    this.domainRouteService.updatePath(this.pathRoute);
  }

}
