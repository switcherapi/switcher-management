import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { delay, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DomainSnapshotComponent } from './domain-snapshot/domain-snapshot.component';
import { MatDialog } from '@angular/material/dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { PathRoute, Types } from 'src/app/model/path-route';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { ConfigService } from 'src/app/services/config.service';
import { GroupService } from 'src/app/services/group.service';
import { DomainTransferDialog } from './domain-transfer/domain-transfer-dialog.component';
import { DomainService } from 'src/app/services/domain.service';
import { AdminService } from 'src/app/services/admin.service';
import { ToastService } from 'src/app/_helpers/toast.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { OnElementAutocomplete } from '../common/element-autocomplete/element-autocomplete.component';
import { SlackService } from 'src/app/services/slack.service';
import { FEATURES } from 'src/app/model/slack';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css']
})
export class DomainComponent implements OnInit, OnDestroy, OnElementAutocomplete {

  private unsubscribe: Subject<void> = new Subject();
  @BlockUI() blockUI: NgBlockUI;

  selectedDomain: PathRoute;
  selectedGroup: PathRoute;
  selectedConfig: PathRoute;
  currentPathRoute: PathRoute;
  icon: number;

  prevScrollpos = window.pageYOffset;
  navControl: boolean = false;
  slackIntegration: boolean = false;
  transferLabel: string = '';

  constructor(
    private domainRouteService: DomainRouteService,
    private adminService: AdminService,
    private dialog: MatDialog,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private domainService: DomainService,
    private configService: ConfigService,
    private groupService: GroupService,
    private slackService: SlackService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.scrollMenuHandler();
    this.updateRoute();
    this.loadDomain();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    window.onscroll = () => {};
  }

  private loadDomain() {
    this.domainRouteService.pathChange.pipe(delay(0), takeUntil(this.unsubscribe)).subscribe(() => {
      this.updateRoute();
      this.checkDomainOwner();

      this.slackService.getSlackAvailability(FEATURES.SLACK_INTEGRATION)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(data => this.slackIntegration = data?.result);
    });
  }

  private updateRoute() {
    this.selectedDomain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.selectedGroup = this.domainRouteService.getPathElement(Types.SELECTED_GROUP);
    this.selectedConfig = this.domainRouteService.getPathElement(Types.SELECTED_CONFIG);
    this.currentPathRoute = this.domainRouteService.getPathElement(Types.CURRENT_ROUTE);
  }

  private checkDomainOwner() {
    this.adminService.getAdmin().pipe(takeUntil(this.unsubscribe)).subscribe(currentUser => {
      if (currentUser) {
        this.transferLabel = currentUser.id == this.selectedDomain.element.owner ? 
          this.selectedDomain.element.transfer ? 'Cancel Transfer' : 'Transfer Domain' : '';
      }
    });
  }

  private scrollMenuHandler() {
    window.onscroll = () => {
      if (!this.navControl && window.innerWidth < 1200) {
        var currentScrollPos = window.pageYOffset;
        if (this.prevScrollpos > currentScrollPos) {
            document.getElementById("navbarMenu").style.top = "0";
        } else {
            document.getElementById("navbarMenu").style.top = "-60px";
        }
        this.prevScrollpos = currentScrollPos;
      } else {
        document.getElementById("navbarMenu").style.top = "0";
      }
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

  onDownloadSnapshot() {
    this.dialog.open(DomainSnapshotComponent, {
      width: '450px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: { }
    });
  }

  onDomainTransfer() {
    this.blockUI.start('Creating request...');
    this.domainService.requestDomainTransfer(this.selectedDomain.id).pipe(takeUntil(this.unsubscribe)).subscribe(domain => {
      if (domain) {
        if (this.transferLabel === 'Transfer Domain') {
          this.transferLabel = 'Cancel Transfer';
          this.dialog.open(DomainTransferDialog, {
            width: '450px',
            minWidth: window.innerWidth < 450 ? '95vw' : '',
            data: {
              request_id: domain.id,
              domain: domain.name
            }
          });
        } else {
          this.transferLabel = 'Transfer Domain';
          this.toastService.showSuccess(`Transfer canceled with success`);
        }
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.blockUI.stop();
    }, () => {
      this.blockUI.stop();
    });
  }

  onSelectElementFilter(value: any): void {
    if (value.type === 'Group') {
      this.updateGroupForRedirect(value);
    } else if (value.type === 'Switcher' || value.type === 'Component') {
      this.updateConfigForRedirect(value);
    }
  }

  getDomainId(): string {
    return this.selectedDomain.id;
  }

  getLabelListChildren() {
    if (this.currentPathRoute) {
      if (this.currentPathRoute.type === Types.DOMAIN_TYPE) {
        return 'Groups';
      } else if (this.currentPathRoute.type === Types.GROUP_TYPE || 
        this.currentPathRoute.type === Types.CONFIG_TYPE) {
        return 'Switchers';
      }
    } else {
      return 'Groups';
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
    } else {
      this.currentPathRoute = this.selectedDomain;
      this.router.navigate(['/dashboard/domain/group']);
    }
  }

  gotoDetails() {
    if (this.currentPathRoute) {
      this.router.navigate([this.currentPathRoute.path], { state: { element: JSON.stringify(this.currentPathRoute.element) } });
    }
  }

  getTitle(): string {
    const components = this.activeRoute.snapshot.routeConfig.children;
    const uri = this.router.routerState.snapshot.url.split('/domain/');
    const component = components.filter(comp => comp.path ===  uri[uri.length-1].split('/')[0]);

    if (component.length && component[0].data) {
      this.icon = component[0].data.icon;
      
      if (this.currentPathRoute) {
        return component[0].data.title.replace('$', this.currentPathRoute.name);
      } else {
        return component[0].data.title.replace('$', this.selectedDomain.name);
      }
    }

    this.icon = 0;
    return this.currentPathRoute ? this.currentPathRoute.name : this.selectedDomain.name;
  }

  getCurrentRoute(): PathRoute {
    return this.currentPathRoute || this.selectedDomain;
  }

  getDomainElement(): string {
    return this.selectedDomain ? JSON.stringify(this.selectedDomain.element) : '';
  }

  getGroupElement(): string {
    return this.selectedGroup ? JSON.stringify(this.selectedGroup.element) : '';
  }

  getConfigElement(): string {
    return this.selectedConfig ? JSON.stringify(this.selectedConfig.element) : '';
  }

  hasSlackIntegration(): boolean {
    return this.selectedDomain?.element.integrations?.slack && this.slackIntegration;
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

  navToggled() {
    this.navControl = !this.navControl;
  }

}
