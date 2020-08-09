import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomainRouteService } from '../../services/domain-route.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PathRoute } from '../model/path-route';
import { delay, takeUntil, startWith, map } from 'rxjs/operators';
import { Types } from '../model/path-route'
import { Subject, Observable } from 'rxjs';
import { DomainSnapshotComponent } from './domain-snapshot/domain-snapshot.component';
import { MatDialog } from '@angular/material/dialog';
import { QueryRef, Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { FormControl } from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { GroupService } from '../../services/group.service';

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

  prevScrollpos = window.pageYOffset;
  navControl: boolean = false;

  smartSearchFormControl = new FormControl('');
  searchListItems: any[] = [];
  searchedValues: Observable<string[]>;
  private query: QueryRef<any>;

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private domainRouteService: DomainRouteService,
    private dialog: MatDialog,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private apollo: Apollo,
    private configService: ConfigService,
    private groupService: GroupService
  ) { }

  ngOnInit() {
    this.scrollMenuHandler();
    
    if (!this.currentPathRoute) {
      this.domainRouteService.pathChange.pipe(delay(0), takeUntil(this.unsubscribe)).subscribe(() => {
        this.updateRoute();
        this.loadKeys();
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

  scrollMenuHandler() {
    window.onscroll = () => {
      if (!this.navControl && window.innerWidth < 1200) {
        var currentScrollPos = window.pageYOffset;
        if (this.prevScrollpos > currentScrollPos) {
            document.getElementById("navbarMenu").style.top = "0";
        } else {
            document.getElementById("navbarMenu").style.top = "-60px";
        }
        this.prevScrollpos = currentScrollPos;
      }
    }
  }

  navToggled() {
    this.navControl = !this.navControl;
  }

  loadKeys() {
    this.query = this.apollo.watchQuery({
      query: this.generateGql(),
      variables: { 
        id: this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id,
      }
    });

    this.query.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(result => {
      if (result) {
        const groups = result.data.domain.group.map(group => {
          return {
            type: 'Group',
            _id: group._id,
            description: group.description,
            parent: '',
            name: group.name
          }
        });

        const switchers = result.data.domain.group.map(group => group.config.map(config => {
          return {
            type: 'Switcher',
            _id: config._id,
            description: config.description,
            parent: group,
            name: config.key
          }
        }));

        const components = result.data.domain.group.map(
          group => group.config.map(config => {
            return {
              type: 'Component',
              _id: config._id,
              description: config.components.toString() || '',
              parent: group,
              name: config.key
            }
        }).filter(comp => comp.description.length));
        
        this.searchListItems = [];
        this.searchListItems.push(...groups);
        this.searchListItems.push(...switchers.flat());
        this.searchListItems.push(...components.flat());
      }
    }, error => {
      ConsoleLogger.printError(error);
    });

    this.searchedValues = this.smartSearchFormControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: any): any[] {
    let filterValue: any[] = [];

    if((value as any).type) {
      filterValue.push(value.name);
      this.smartSearchFormControl.setValue(value.name);
      this.redirect(value);
      return;
    }

    filterValue = value.toLowerCase();
    return this.searchListItems.filter(item =>
      item.name.toLowerCase().includes(filterValue) ||
      item.description.toLowerCase().includes(filterValue)
    );
  }

  private redirect(item: any) {
    if (item.type === 'Group') {
      this.updateGroupForRedirect(item);
    } else if (item.type === 'Switcher' || item.type === 'Component') {
      this.updateConfigForRedirect(item);
    }
  }

  private updateConfigForRedirect(item: any) {
    this.configService.getConfigById(item._id, true).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        const pathRoute: PathRoute = {
          id: item._id,
          element: data,
          name: item.name,
          path: '/dashboard/domain/group/switcher/detail',
          type: Types.CONFIG_TYPE
        };
        this.domainRouteService.updatePath(pathRoute, true);
        this.updateGroupForRedirect(item.parent, true);
      }
    }, error => {
      ConsoleLogger.printError(error);
    });
  }

  private updateGroupForRedirect(item: any, parent = false) {
    this.groupService.getGroupById(item._id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        const pathRouteGroup: PathRoute = {
          id: data.id,
          element: data,
          name: data.name,
          path: '/dashboard/domain/group/detail',
          type: Types.GROUP_TYPE
        };
        this.domainRouteService.updatePath(pathRouteGroup, !parent);

        if (!parent) {
          this.router.navigate(['/dashboard/domain/group/']).then(data =>
            this.router.navigate(['/dashboard/domain/group/detail']));
        } else {
          this.router.navigate(['/dashboard/domain/group/switcher']).then(data =>
            this.router.navigate(['/dashboard/domain/group/switcher/detail']));
        }
      }
    });
  }

  generateGql(): any {
    return gql`
      query domain($id: String!) {
        domain(_id: $id) {
          group {
            _id
            name
            description
            config {
                _id
                key
                description
                components
                strategies {
                    values
                }
            }
          }
        }
      }
  `;
  }

}
