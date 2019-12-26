import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from './domain-route.service';

@Component({
  selector: 'app-domain-route',
  templateUrl: './domain-route.component.html',
  styleUrls: ['./domain-route.component.css']
})
export class DomainRouteComponent implements OnInit {

  pathRouters = [];

  constructor(
    private domainRouteService: DomainRouteService
  ) { }

  ngOnInit() {
    this.domainRouteService.pathChange.subscribe(pathRouters => {
      this.pathRouters = pathRouters;
    })
  }

  getPathRoute() {
    return this.domainRouteService;
  }
}
