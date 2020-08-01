import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomainRouteService } from '../../services/domain-route.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PathRoute } from '../model/path-route';
import { delay, takeUntil } from 'rxjs/operators';
import { Types } from '../model/path-route'
import { Subject } from 'rxjs';
import { DomainSnapshotComponent } from './domain-snapshot/domain-snapshot.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css']
})
export class DomainComponent implements OnInit, OnDestroy {

  selectedDomain: PathRoute;
  selectedGroup: PathRoute;
  selectedConfig: PathRoute;
  currentPathRoute: PathRoute;
  icon: number;

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private domainRouteService: DomainRouteService,
    private dialog: MatDialog,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    if (!this.currentPathRoute) {
      this.domainRouteService.pathChange.pipe(delay(0), takeUntil(this.unsubscribe)).subscribe(() => {
        this.updateRoute();
      });
    }

    this.updateRoute();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  updateRoute() {
    this.selectedDomain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.selectedGroup = this.domainRouteService.getPathElement(Types.SELECTED_GROUP);
    this.selectedConfig = this.domainRouteService.getPathElement(Types.SELECTED_CONFIG);
    this.currentPathRoute = this.domainRouteService.getPathElement(Types.CURRENT_ROUTE);
    this.getTitle();
  }

  onDownloadSnapshot() {
    this.dialog.open(DomainSnapshotComponent, {
      width: '450px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: { }
    });
  }

  getLabelListChildren() {
    if (this.currentPathRoute) {
      if (this.currentPathRoute.type === Types.DOMAIN_TYPE) {
        return 'Groups';
      } else if (this.currentPathRoute.type === Types.GROUP_TYPE || 
        this.currentPathRoute.type === Types.CONFIG_TYPE) {
        return 'Switchers';
      }
    }
  }

  gotoListChildren() {
    if (this.currentPathRoute) {
      if (this.currentPathRoute.type === Types.DOMAIN_TYPE) {
        this.router.navigate(['/dashboard/domain/group']);
      } else if (this.currentPathRoute.type === Types.GROUP_TYPE || 
        this.currentPathRoute.type === Types.CONFIG_TYPE) {
        this.router.navigate(['/dashboard/domain/group/switcher']);
      }
    }
  }

  gotoDetails() {
    if (this.currentPathRoute) {
      this.router.navigate([this.currentPathRoute.path], { state: { element: JSON.stringify(this.currentPathRoute.element) } });
    }
  }

  getTitle(): String {
    const components = this.activeRoute.snapshot.routeConfig.children;
    const uri = this.router.routerState.snapshot.url.split('/domain/');
    const component = components.filter(comp => comp.path ===  uri[uri.length-1].split('/')[0]);

    if (component.length && component[0].data) {
      this.icon = component[0].data.icon;
      return component[0].data.title.replace('$', this.currentPathRoute.name);
    }

    this.icon = 0;
    return this.currentPathRoute ? this.currentPathRoute.name : '';
  }

  getCurrentRoute(): PathRoute {
    return this.currentPathRoute;
  }

  getDomain(): PathRoute {
    return this.selectedDomain;
  }

  getDomainElement(): string {
    
    return this.selectedDomain ? JSON.stringify(this.selectedDomain.element) : '';
  }

  getGroup(): PathRoute {
    return this.selectedGroup;
  }

  getGroupElement(): string {
    return this.selectedGroup ? JSON.stringify(this.selectedGroup.element) : '';
  }

  getConfig(): PathRoute {
    return this.selectedConfig;
  }

  getConfigElement(): string {
    return this.selectedConfig ? JSON.stringify(this.selectedConfig.element) : '';
  }

  showPath(type: string) {
    if (this.currentPathRoute) {
      if (this.currentPathRoute.type === Types.GROUP_TYPE) {
        return type === Types.DOMAIN_TYPE ? true : type === Types.GROUP_TYPE;
      } else if (this.currentPathRoute.type === Types.CONFIG_TYPE) {
        return true;
      }
    }
    return false;
  }

}
