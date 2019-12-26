import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from '../domain-route/domain-route.service';
import { PathRoute } from '../domain-route/path-route';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit {

  constructor(
    private domainRouteService: DomainRouteService,
    private pathRoute: PathRoute,
  ) { }

  ngOnInit() {
    this.updatePathRoute();
  }

  updatePathRoute() {
    this.domainRouteService.clearPath();
    
    this.pathRoute = {
      id: 1,
      name: 'Domain Name',
      path: '/dashboard/domain',
      type: 'Domain'
    };

    this.domainRouteService.updatePath(this.pathRoute);

    this.pathRoute = {
      id: 1,
      name: 'Group 1',
      path: '/dashboard/domain/group/detail',
      type: 'Group'
    };

    this.domainRouteService.updatePath(this.pathRoute);
  }

}
