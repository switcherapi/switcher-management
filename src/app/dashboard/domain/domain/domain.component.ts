import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from './domain-route.service';
import { Router } from '@angular/router';
import { PathRoute } from './path-route';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css']
})
export class DomainComponent implements OnInit {

  selectedDomain: PathRoute;
  selectedGroup: PathRoute;
  selectedConfig: PathRoute;

  constructor(
    private domainRouteSerice: DomainRouteService,
    private router: Router,
    private currentPathRoute: PathRoute
  ) { }

  ngOnInit() {
    this.domainRouteSerice.pathChange.pipe(delay(0)).subscribe((pathRoute: PathRoute) => {
      this.selectedDomain = this.domainRouteSerice.getPathElement('selectedDomain');
      this.selectedGroup = this.domainRouteSerice.getPathElement('selectedGroup');
      this.selectedConfig = this.domainRouteSerice.getPathElement('selectedConfig');
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

  getCurrentRoute(): PathRoute {
    return this.currentPathRoute;
  }

  getDomain(): PathRoute {
    return this.selectedDomain;
  }

  getGroup(): PathRoute {
    return this.selectedGroup;
  }

  getConfig(): PathRoute {
    return this.selectedConfig;
  }

}
