import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { DomainSnapshotComponent } from './domain-snapshot/domain-snapshot.component';
import { MatDialog } from '@angular/material/dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { ConfigService } from 'src/app/services/config.service';
import { GroupService } from 'src/app/services/group.service';
import { DomainTransferDialogComponent } from './domain-transfer/domain-transfer-dialog.component';
import { DomainService } from 'src/app/services/domain.service';
import { ToastService } from 'src/app/_helpers/toast.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { OnElementAutocomplete } from '../common/element-autocomplete/element-autocomplete.component';
import { environment } from 'src/environments/environment';
import { Domain } from 'src/app/model/domain';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { PathRoute, Types } from 'src/app/model/path-route';
import { Group } from 'src/app/model/group';
import { Config } from 'src/app/model/config';
import { Configuration, GraphQLConfigurationResultSet } from 'src/app/model/configuration';
import { ApolloQueryResult } from '@apollo/client/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { FeatureService } from 'src/app/services/feature.service';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css']
})
export class DomainComponent implements OnInit, OnDestroy, OnElementAutocomplete {

  private unsubscribe: Subject<void> = new Subject();
  @BlockUI() blockUI: NgBlockUI;

  title: string;
  icon: number;

  domainId: string;
  domainName: string;

  domain: Domain;
  group: Group;
  config: Config;

  selectedDomainPath: string;
  selectedGroupPath: string;
  selectedConfigPath: string;
  
  currentPath = new PathRoute();
  prevScrollpos = window.scrollY;
  navControl: boolean = false;
  slackIntegration: boolean = false;
  transferLabel: string = '';

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private domainRouteService: DomainRouteService,
    private domainService: DomainService,
    private configService: ConfigService,
    private groupService: GroupService,
    private featureService: FeatureService,
    private toastService: ToastService
  ) {
    this.route.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = params.name;
    });
  }

  ngOnInit() {
    this.scrollMenuHandler();
    this.domainRouteService.pathChange
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => { 
        this.currentPath = data;
        this.loadConfiguration();

        if (environment.slackUrl) {
          this.featureService.isEnabled({ feature: 'SLACK_INTEGRATION' })
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(feature => this.slackIntegration = feature?.status);
        }
    });
    
    this.domainRouteService.viewHeaderEvent
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        this.title = data.title;
        this.icon = data.icon;
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    window.onscroll = () => {
      return;
    };
  }

  onDownloadSnapshot() {
    this.dialog.open(DomainSnapshotComponent, {
      width: '450px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: {
        domainId: this.domainId
      }
    });
  }

  onDomainTransfer() {
    this.blockUI.start('Creating request...');
    this.domainService.requestDomainTransfer(this.currentPath.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(domain => {
        if (domain) {
          if (this.transferLabel === 'Transfer Domain') {
            this.transferLabel = 'Cancel Transfer';
            this.dialog.open(DomainTransferDialogComponent, {
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
    if (value.type === Types.GROUP_TYPE) {
      this.redirectToGroup(value);
    } else if (value.type === Types.CONFIG_TYPE || value.type === Types.COMPONENT_TYPE) {
      this.redirectToSwitcher(value);
    }
  }

  getDomainId(): string {
    return this.domainId;
  }

  getLabelListChildren() {
    if (this.currentPath.type === Types.GROUP_TYPE || 
        this.currentPath.type === Types.CONFIG_TYPE)
      return 'Switchers';
    return 'Groups';
  }

  gotoListChildren() {
    if (this.currentPath.type === Types.DOMAIN_TYPE) {
      this.router.navigate([`${this.currentPath.path}/groups`]);
    } else if (this.currentPath.type === Types.GROUP_TYPE) {
      this.router.navigate([`${this.currentPath.path}/switchers`]);
    } else if (this.currentPath.type === Types.CONFIG_TYPE) {
      this.router.navigate([`${this.currentPath.path.split('switchers')[0]}/switchers`]);
    }
  }

  gotoDetails(path?: string) {
    if (path) {
      return this.router.navigate([path]);
    }
    return this.router.navigate([`${this.currentPath.path}`]);
  }

  gotoMetrics() {
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/metrics`], 
      { state: { fetch: false } });
  }

  gotoChangeLog() {
    this.router.navigate([`${this.currentPath.path}/change-log`], 
      { state: { fetch: false } });
  }

  gotoComponents() {
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/components`], 
      { state: { fetch: false } });
  }

  gotoEnvironments() {
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/environments`], 
      { state: { fetch: false } });
  }

  gotoTeams() {
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/teams`], 
      { state: { fetch: false } });
  }

  gotoSlackIntegration() {
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/integration/slack`], 
      { state: { fetch: false } });
  }

  getSlackUrl(): string {
    return environment.slackUrl;
  }

  hasSlackIntegration(): boolean {
    return this.slackIntegration && this.transferLabel.length > 0;
  }

  hasSlackInstalled(): boolean {
    return this.domain.integrations?.slack != undefined;
  }

  navToggled() {
    this.navControl = !this.navControl;
  }

  private loadConfiguration() {
    const path = this.domainRouteService.getStoredPath();
    if (path) {
      this.currentPath = path;
    }

    let query: Observable<ApolloQueryResult<GraphQLConfigurationResultSet>>;
    if (this.currentPath.type === Types.GROUP_TYPE) {
      query = this.domainService.executeConfigurationGroupQuery(this.domainId, this.currentPath.id);
    } else if (this.currentPath.type === Types.CONFIG_TYPE) {
      query = this.domainService.executeConfigurationConfigQuery(this.domainId, this.currentPath.id);
    } else {
      query = this.domainService.executeConfigurationQuery(this.domainId);
    }

    query.pipe(takeUntil(this.unsubscribe)).subscribe(response => {
      if (response) {
        this.updateData(response.data.configuration);
        this.checkDomainOwner();
      }
    }, error => {
      ConsoleLogger.printError(error);
    });
  }

  private updateData(configuration: Configuration) {
    this.domain = configuration.domain;
    this.group = configuration.group ? configuration.group[0] : undefined;
    this.config = configuration.config ? configuration.config[0] : undefined;

    this.selectedDomainPath = `/dashboard/domain/${this.domainName}/${this.domainId}`;
    this.selectedGroupPath = `${this.selectedDomainPath}/groups/${this.group?.id}`;
    this.selectedConfigPath = `${this.selectedGroupPath}/switchers/${this.config?.id}`;
  }

  private checkDomainOwner() {
    const currentUserId = this.authService.getUserInfo('sessionid');
    if (currentUserId == this.domain.owner) {
      if (this.domain.transfer)
        this.transferLabel = 'Cancel Transfer';
      else
        this.transferLabel = 'Transfer Domain';
    } else {
      this.transferLabel = '';
    }
  }

  private scrollMenuHandler() {
    window.onscroll = () => {
      if (!this.navControl && window.innerWidth < 1200) {
        const currentScrollPos = window.scrollY;
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

  private redirectToSwitcher(item: any) {
    this.configService.getConfigById(item._id, true)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(config => {
        if (config) {
          this.config = config;
          this.currentPath.id = config.id;
          this.currentPath.type = Types.CONFIG_TYPE;
          this.currentPath.path = `/dashboard/domain/${this.domainName}/${this.domainId}/groups/${item.parent._id}/switchers/${config.id}`;
          this.router.navigate([this.currentPath.path], { state: { element: JSON.stringify(this.config) } });
        }
    }, error => {
      ConsoleLogger.printError(error);
    });
  }

  private redirectToGroup(item: any) {
    this.groupService.getGroupById(item._id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(group => {
        if (group) {
          this.group = group;
          this.currentPath.id = group.id;
          this.currentPath.type = Types.GROUP_TYPE;
          this.currentPath.path = `/dashboard/domain/${this.domainName}/${this.domainId}/groups/${group.id}`;
          this.router.navigate([this.currentPath.path], { state: { element: JSON.stringify(this.group) } });
        }
    }, error => {
      ConsoleLogger.printError(error);
    });
  }

}
