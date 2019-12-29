import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from '../domain/domain-route.service';
import { PathRoute } from '../domain/path-route';

@Component({
  selector: 'app-config-detail',
  templateUrl: './config-detail.component.html',
  styleUrls: ['./config-detail.component.css']
})
export class ConfigDetailComponent implements OnInit {

  constructor(
    private domainRouteService: DomainRouteService,
    private pathRoute: PathRoute) { }

  ngOnInit() {
    this.updatePathRoute();
  }

  updatePathRoute() {
    // this.domainRouteService.clearPath();
    
    // this.pathRoute = {
    //   id: '1',
    //   name: 'Domain Name',
    //   path: '/dashboard/domain',
    //   type: 'Domain'
    // };

    // this.domainRouteService.updatePath(this.pathRoute);

    // this.pathRoute = {
    //   id: '1',
    //   name: 'Group 1',
    //   path: '/dashboard/domain/group/detail',
    //   type: 'Group'
    // };

    this.domainRouteService.updatePath(this.pathRoute);

    this.pathRoute = {
      id: '1',
      name: 'Config 1',
      path: '/dashboard/domain/group/config/detail',
      type: 'Config'
    };

    this.domainRouteService.updatePath(this.pathRoute);
  }

}
