import { Component, ViewChild, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SETTINGS_PARAM, Slack } from 'src/app/model/slack';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { SlackService } from 'src/app/services/slack.service';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { DataUtils } from 'src/app/_helpers/data-utils';
import { ToastService } from 'src/app/_helpers/toast.service';
import { SlackSettingsComponent } from './slack-settings/slack-settings.component';
import { FeatureService } from 'src/app/services/feature.service';
import { Types } from 'src/app/model/path-route';
import { AdminService } from 'src/app/services/admin.service';
import { NgClass, DatePipe } from '@angular/common';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-ext-slack',
    templateUrl: './ext-slack.component.html',
    styleUrls: [
        '../common/css/detail.component.css',
        './ext-slack.component.css'
    ],
    imports: [NgClass, MatFormField, MatLabel, MatInput, MatIcon, SlackSettingsComponent, MatButton, DatePipe]
})
export class ExtSlackComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly domainRouteService = inject(DomainRouteService);
  private readonly slackService = inject(SlackService);
  private readonly featureService = inject(FeatureService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly _modalService = inject(NgbModal);

  readonly detailBodyStyle = signal('detail-body loading');
  readonly domainId = toSignal(
    this.activatedRoute.parent.params.pipe(
      map(params => params['domainid'])
    ),
    { initialValue: '' }
  );
  readonly domainName = toSignal(
    this.activatedRoute.parent.params.pipe(
      map(params => decodeURIComponent(params['name']))
    ),
    { initialValue: '' }
  );
  readonly slackUpdate = signal(false);
  readonly loading = signal(true);
  readonly slack = signal<Slack | null>(null);
  readonly fetch = toSignal(
    this.activatedRoute.paramMap.pipe(
      map(() => globalThis.history.state),
      map(data => data.navigationId === 1)
    ),
    { initialValue: true }
  );
  readonly allowUpdate = signal(false);

  @ViewChild(SlackSettingsComponent) 
  slackSettings: SlackSettingsComponent;

  constructor() {
    effect(() => {
      const domainName = this.domainName();
      const domainId = this.domainId();
      
      if (domainName && domainId) {
        this.domainRouteService.updateView(domainName, 0);
        this.loadPermissions();
        this.loadSlack();
        this.updateRoute();
      }
    });
  }

  onUpdate(): void {
    const domainId = this.domainId();
    const settings = this.slackSettings.settings();
    const ignoredEnvs = this.slackSettings.ignoredEnvironments();
    const frozenEnvs = this.slackSettings.frozenEnvironments();
    
    if (settings && DataUtils.isArrDiff(settings.ignored_environments, ignoredEnvs)) {
      this.slackService.updateEnvironments(
        domainId, SETTINGS_PARAM.IGNORED_ENVIRONMENT, ignoredEnvs)
        .subscribe(() => this.toastService.showSuccess('Ignored Environments updated'));
    }

    if (settings && DataUtils.isArrDiff(settings.frozen_environments, frozenEnvs)) {
      this.slackService.updateEnvironments(
        domainId, SETTINGS_PARAM.FROZEN_ENVIRONMENT, frozenEnvs)
        .subscribe(() => this.toastService.showSuccess('Frozen Environments updated'));
    }

    this.slackSettings.updateSettings({ 
      ignored_environments: ignoredEnvs,
      frozen_environments: frozenEnvs
    });
  }

  onUninstall(): void {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Slack Uninstall';
    modalConfirmation.componentInstance.question = 'Are you sure you want to uninstall Slack?';
    modalConfirmation.result.then((result) => {
      if (result) {
        const domainId = this.domainId();
        const domainName = this.domainName();
        
        this.slackService.unlinkInstallation(domainId)
          .subscribe({
            next: data => {
              if (data) {
                this.router.navigate([`/dashboard/domain/${domainName}/${domainId}`]);
                this.domainRouteService.updatePath(domainId, domainName, 
                  Types.DOMAIN_TYPE, `/dashboard/domain/${domainName}/${domainId}`, true);
                this.toastService.showSuccess(data.message);
              }
            },
            error: error => {
              ConsoleLogger.printError(error);
              this.toastService.showError('Unable to uninstall Slack');
            }
          });
      }
    });
  }

  onResetTicketsHistory(): void {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Reset Ticket History';
    modalConfirmation.componentInstance.question = 'Are you sure you want to delete all tickets?';
    modalConfirmation.result.then((result) => {
      if (result) {
        const slack = this.slack();
        const domainId = this.domainId();
        
        if (slack) {
          this.slackService.resetTickets(slack.team_id, domainId)
            .subscribe({
              next: data => {
                if (data) {
                  this.toastService.showSuccess(data.message);
                  this.slack.set({ ...slack, tickets_opened: 0 });
                }
              },
              error: error => {
                ConsoleLogger.printError(error);
                this.toastService.showError('Unable to reset tickets');
              }
            });
        }
      }
    });
  }

  private loadSlack(): void {
    this.loading.set(true);
    const domainId = this.domainId();
    const domainName = this.domainName();

    this.slackService.getSlackInstallation(domainId)
      .subscribe({
        next: slack => {
          this.slack.set(slack);
          this.slackSettings.loadSettings(slack);
          this.loadSlackAvailability();
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.toastService.showError('Unable to display Slack Integrations properties');
          this.router.navigate([`/dashboard/domain/${domainName}/${domainId}`]);
        },
        complete: () => {
          this.loading.set(false);
          this.detailBodyStyle.set('detail-body ready');
        }
      });
  }

  private loadSlackAvailability(): void {
    this.featureService.isEnabled({ feature: 'SLACK_UPDATE' })
    .subscribe(feature => {
      const isEnabled = feature?.status || false;
      this.slackUpdate.set(isEnabled);
      this.slackSettings.updatable.set(isEnabled);
    });
  }

  private loadPermissions(): void {
    const domainId = this.domainId();
    
    this.adminService.readCollabPermission(domainId, ['UPDATE'], 'ADMIN')
      .subscribe(data => {
        for (const perm of data) {
          if (perm.action === 'UPDATE') {
            this.allowUpdate.set(perm.result === 'ok');
          }
        }
      }
    );
  }

  private updateRoute(): void {
    const fetch = this.fetch();
    const domainId = this.domainId();
    const domainName = this.domainName();
    
    if (fetch) {
      this.domainRouteService.updatePath(domainId, domainName, Types.DOMAIN_TYPE, 
        `/dashboard/domain/${domainName}/${domainId}`);
    } else {
      this.domainRouteService.refreshPath();
    }
  }
  
}