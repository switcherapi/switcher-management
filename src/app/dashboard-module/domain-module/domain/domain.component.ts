import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
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
import { OnElementAutocomplete, ElementAutocompleteComponent } from '../common/element-autocomplete/element-autocomplete.component';
import { environment } from 'src/environments/environment';
import { Domain } from 'src/app/model/domain';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { PathRoute, Types } from 'src/app/model/path-route';
import { Group } from 'src/app/model/group';
import { Config } from 'src/app/model/config';
import { Configuration, GraphQLConfigurationResultSet } from 'src/app/model/configuration';
import { Apollo } from 'apollo-angular/apollo';
import { AuthService } from 'src/app/auth/services/auth.service';
import { FeatureService } from 'src/app/services/feature.service';
import { BasicComponent } from '../common/basic-component';
import { BlockUIComponent } from '../../../shared/block-ui/block-ui.component';
import { ToastsContainerComponent } from '../../../_helpers/toasts-container.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-domain',
    templateUrl: './domain.component.html',
    styleUrls: ['./domain.component.css'],
    imports: [BlockUIComponent, ToastsContainerComponent, MatIcon, MatButton, MatMenuTrigger, 
      MatMenu, MatMenuItem, MatTooltip, ElementAutocompleteComponent, MatProgressSpinner, RouterOutlet
    ]
})
export class DomainComponent extends BasicComponent implements OnInit, OnDestroy, OnElementAutocomplete {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly domainRouteService = inject(DomainRouteService);
  private readonly domainService = inject(DomainService);
  private readonly configService = inject(ConfigService);
  private readonly groupService = inject(GroupService);
  private readonly featureService = inject(FeatureService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly unsubscribe = new Subject<void>();

  loading = true;
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
  prevScrollpos = globalThis.scrollY;
  navControl = false;
  slackIntegration = false;
  transferLabel = '';

  constructor() {
    super();
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
        this.loadConfiguration(data.forceFetch);
    });
    
    this.router.events
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadConfiguration();
      });

    if (environment.slackUrl) {
      this.featureService.isEnabled({ feature: 'SLACK_INTEGRATION' })
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(feature => this.slackIntegration = feature?.status);
    }
    
    this.domainRouteService.viewHeaderEvent
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        this.title = data.title;
        this.icon = data.icon;
        this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    globalThis.onscroll = () => {
      return;
    };
  }

  onDownloadSnapshot() {
    this.dialog.open(DomainSnapshotComponent, {
      width: '450px',
      minWidth: globalThis.innerWidth < 450 ? '95vw' : '',
      data: {
        domainId: this.domainId
      }
    });
  }

  onDomainTransfer() {
    this.setBlockUI(true, 'Creating request...');
    this.domainService.requestDomainTransfer(this.currentPath.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: domain => {
          if (domain) {
            if (this.transferLabel === 'Transfer Domain') {
              this.transferLabel = 'Cancel Transfer';
              this.dialog.open(DomainTransferDialogComponent, {
                width: '450px',
                minWidth: globalThis.innerWidth < 450 ? '95vw' : '',
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
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.setBlockUI(false);
        },
        complete: () => {
          this.setBlockUI(false);
        }
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
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/metrics`]);
  }

  gotoChangeLog() {
    this.router.navigate([`${this.currentPath.path}/change-log`]);
  }

  gotoComponents() {
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/components`]);
  }

  gotoEnvironments() {
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/environments`]);
  }

  gotoTeams() {
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/teams`]);
  }

  gotoSlackIntegration() {
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/integration/slack`], 
      { state: { fetch: false } });
  }

  gotoGitOpsIntegration() {
    this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}/integration/gitops`], 
      { state: { fetch: false } });
  }

  getSlackUrl(): string {
    return environment.slackUrl;
  }

  hasSlackIntegration(): boolean {
    return this.slackIntegration;
  }

  hasSlackInstalled(): boolean {
    return this.domain?.integrations?.slack != undefined;
  }

  canInstallSlack(): boolean {
    return this.transferLabel.length > 0;
  }

  navToggled() {
    this.navControl = !this.navControl;
  }

  private loadConfiguration(forceFetch = false) {
    this.setLoading(true);

    const path = this.domainRouteService.getStoredPath();
    if (path) {
      this.currentPath = path;
    }

    let query: Observable<Apollo.QueryResult<GraphQLConfigurationResultSet>>;
    if (this.currentPath.type === Types.GROUP_TYPE) {
      query = this.domainService.executeConfigurationGroupQuery(this.domainId, this.currentPath.id);
    } else if (this.currentPath.type === Types.CONFIG_TYPE) {
      query = this.domainService.executeConfigurationConfigQuery(this.domainId, this.currentPath.id);
    } else {
      query = this.domainService.executeConfigurationQuery(this.domainId, forceFetch);
    }

    query.pipe(takeUntil(this.unsubscribe)).subscribe({
      next: response => {
        if (response) {
          this.updateData(response.data.configuration);
          this.checkDomainOwner();
        }
      },
      error: error => {
        ConsoleLogger.printError(error);
        this.setLoading(false);
      }
    });
  }

  private updateData(configuration: Configuration) {
    this.domain = configuration.domain;
    this.group = configuration.group ? configuration.group[0] : undefined;
    this.config = configuration.config ? configuration.config[0] : undefined;

    this.selectedDomainPath = `/dashboard/domain/${this.domainName}/${this.domainId}`;
    this.selectedGroupPath = `${this.selectedDomainPath}/groups/${this.group?.id}`;
    this.selectedConfigPath = `${this.selectedGroupPath}/switchers/${this.config?.id}`;

    this.setLoading(false);
  }

  private checkDomainOwner() {
    const currentUserId = this.authService.getUserInfo('sessionid');
    if (currentUserId == this.domain?.owner) {
      if (this.domain.transfer)
        this.transferLabel = 'Cancel Transfer';
      else
        this.transferLabel = 'Transfer Domain';
    } else {
      this.transferLabel = '';
    }
  }

  private scrollMenuHandler() {
    globalThis.onscroll = () => {
      if (!this.navControl && globalThis.innerWidth < 1200) {
        const currentScrollPos = globalThis.scrollY;
        if (this.prevScrollpos > currentScrollPos) {
            document.getElementById("navbarMenu").style.top = "0";
        } else {
            document.getElementById("navbarMenu").style.top = "-90px";
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
      .subscribe({
        next: config => {
          if (config) {
            this.config = config;
            this.currentPath.id = config.id;
            this.currentPath.type = Types.CONFIG_TYPE;
            this.currentPath.path = `/dashboard/domain/${this.domainName}/${this.domainId}/groups/${item.parent._id}/switchers/${config.id}`;
            this.router.navigate([this.currentPath.path], { state: { element: JSON.stringify(this.config) } });
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
        }
      });
  }

  private redirectToGroup(item: any) {
    this.groupService.getGroupById(item._id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: group => {
          if (group) {
            this.group = group;
            this.currentPath.id = group.id;
            this.currentPath.type = Types.GROUP_TYPE;
            this.currentPath.path = `/dashboard/domain/${this.domainName}/${this.domainId}/groups/${group.id}`;
            this.router.navigate([this.currentPath.path], { state: { element: JSON.stringify(this.group) } });
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
        }
      });
  }

  private setLoading(value: boolean) {
    this.loading = value;
    this.cdr.detectChanges();
  }

}
