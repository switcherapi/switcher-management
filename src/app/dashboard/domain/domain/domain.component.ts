import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from '../services/domain-route.service';
import { Router } from '@angular/router';
import { PathRoute } from '../model/path-route';
import { delay } from 'rxjs/operators';
import { Types } from '../../domain/model/path-route'

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
      this.selectedDomain = this.domainRouteSerice.getPathElement(Types.SELECTED_DOMAIN);
      this.selectedGroup = this.domainRouteSerice.getPathElement(Types.SELECTED_GROUP);
      this.selectedConfig = this.domainRouteSerice.getPathElement(Types.SELECTED_CONFIG);
      this.currentPathRoute = pathRoute;
    })
  }

  getLabelListChildren() {
    if (this.currentPathRoute.type === Types.DOMAIN_TYPE) {
      return 'Groups';
    } else if (this.currentPathRoute.type === Types.GROUP_TYPE || 
      this.currentPathRoute.type === Types.CONFIG_TYPE) {
      return 'Switchers';
    }
  }

  gotoListChildren() {
    if (this.currentPathRoute.type === Types.DOMAIN_TYPE) {
      this.router.navigate(['/dashboard/domain/groups']);
    } else if (this.currentPathRoute.type === Types.GROUP_TYPE || 
      this.currentPathRoute.type === Types.CONFIG_TYPE) {
      this.router.navigate(['/dashboard/domain/group/configs']);
    }
  }

  gotoDetails() {
    this.router.navigate([this.currentPathRoute.path], { state: { element: JSON.stringify(this.currentPathRoute.element) } });
  }

  getCurrentRoute(): PathRoute {
    return this.currentPathRoute;
  }

  getDomain(): PathRoute {
    return this.selectedDomain;
  }

  getDomainElement(): string {
    return JSON.stringify(this.selectedDomain.element);
  }

  getGroup(): PathRoute {
    return this.selectedGroup;
  }

  getGroupElement(): string {
    return JSON.stringify(this.selectedGroup.element);
  }

  getConfig(): PathRoute {
    return this.selectedConfig;
  }

  getConfigElement(): string {
    return JSON.stringify(this.selectedConfig.element);
  }

}
