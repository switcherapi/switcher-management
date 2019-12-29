import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from './domain-route.service';
import { Router } from '@angular/router';
import { PathRoute } from './path-route';
import { startWith, tap, delay } from 'rxjs/operators';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css']
})
export class DomainComponent implements OnInit {

  pathRouters = [];

  constructor(
    private domainRouteSerice: DomainRouteService,
    private router: Router,
    private currentPathRoute: PathRoute
  ) { }

  ngOnInit() {
    this.domainRouteSerice.pathChange.pipe(delay(0)).subscribe((pathRoute: PathRoute) => {
        if (pathRoute.type === 'Domain') {
          this.pathRouters[0] = pathRoute;
        } else if (pathRoute.type === 'Group') {
          this.pathRouters[1] = pathRoute;
        } else if (pathRoute.type === 'Config') {
          this.pathRouters[2] = pathRoute;
        }
  
        this.currentPathRoute = pathRoute;
      })
  }

  getLabelListChildren() {
    if (this.currentPathRoute.type === 'Domain') {
      return 'Groups';
    } else if (this.currentPathRoute.type === 'Group' || this.currentPathRoute.type === 'Config') {
      return 'Switchers';
    }
  }

  gotoListChildren() {
    if (this.currentPathRoute.type === 'Domain') {
      this.router.navigate(['/dashboard/domain/groups']);
    } else if (this.currentPathRoute.type === 'Group' || this.currentPathRoute.type === 'Config') {
      this.router.navigate(['/dashboard/domain/group/configs']);
    }
  }

  gotoDetails() {
    this.router.navigate([this.currentPathRoute.path], { queryParams: { id: this.currentPathRoute.id } });
  }

  getCurrentRoute() {
    return this.currentPathRoute;
  }

}
