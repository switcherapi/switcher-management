import { OnDestroy, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
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

@Component({
  selector: 'app-ext-slack',
  templateUrl: './ext-slack.component.html',
  styleUrls: [
    '../common/css/detail.component.css', 
    './ext-slack.component.css'
  ]
})
export class ExtSlackComponent implements OnInit, OnDestroy {
  private readonly unsubscribe = new Subject<void>();
  detailBodyStyle = 'detail-body loading';

  @ViewChild(SlackSettingsComponent) 
  slackSettings: SlackSettingsComponent;

  domainId: string;
  domainName: string;
  slackUpdate = false;
  loading = true;
  slack: Slack;
  fetch = true;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly domainRouteService: DomainRouteService,
    private readonly slackService: SlackService,
    private readonly featureService: FeatureService,
    private readonly toastService: ToastService,
    private readonly router: Router,
    private readonly _modalService: NgbModal
  ) { 
    this.activatedRoute.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });

    this.activatedRoute.paramMap
      .pipe(map(() => window.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.fetch = data.navigationId === 1);
  }

  ngOnInit(): void {
    this.domainRouteService.updateView(this.domainName, 0);
    this.loadSlack();
    this.updateRoute();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onUpdate(): void {
    if (DataUtils.isArrDiff(
      this.slackSettings.settings.ignored_environments, this.slackSettings.ignoredEnvironments)) {
      this.slackService.updateEnvironments(
        this.domainId, SETTINGS_PARAM.IGNORED_ENVIRONMENT, this.slackSettings.ignoredEnvironments)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(() => this.toastService.showSuccess('Ignored Environments updated'));
    }

    if (DataUtils.isArrDiff(
      this.slackSettings.settings.frozen_environments, this.slackSettings.frozenEnvironments)) {
      this.slackService.updateEnvironments(
        this.domainId, SETTINGS_PARAM.FROZEN_ENVIRONMENT, this.slackSettings.frozenEnvironments)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(() => this.toastService.showSuccess('Frozen Environments updated'));
    }

    this.slackSettings.updateSettings({ 
      ignored_environments: this.slackSettings.ignoredEnvironments,
      frozen_environments: this.slackSettings.frozenEnvironments
    });
  }

  onUninstall(): void {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Slack Uninstall';
    modalConfirmation.componentInstance.question = 'Are you sure you want to uninstall Slack?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.slackService.unlinkInstallation(this.domainId)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: data => {
              if (data) {
                this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}`]);
                this.domainRouteService.updatePath(this.domainId, this.domainName, 
                  Types.DOMAIN_TYPE, `/dashboard/domain/${this.domainName}/${this.domainId}`, true);
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
        this.slackService.resetTickets(this.slack.team_id, this.domainId)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: data => {
              if (data) {
                this.toastService.showSuccess(data.message);
                this.slack.tickets_opened = 0;
              }
            },
            error: error => {
              ConsoleLogger.printError(error);
              this.toastService.showError('Unable to reset tickets');
            }
          });
      }
    });
  }

  private loadSlack(): void {
    this.loading = true;

    this.slackService.getSlackInstallation(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: slack => {
          this.slack = slack;
          this.slackSettings.loadSettings(this.slack);
          this.loadSlackAvailability();
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.toastService.showError('Unable to display Slack Integrations properties');
          this.router.navigate([`/dashboard/domain/${this.domainName}/${this.domainId}`]);
        },
        complete: () => {
          this.loading = false;
          this.detailBodyStyle = 'detail-body ready';
        }
      });
  }

  private loadSlackAvailability(): void {
    this.featureService.isEnabled({ feature: 'SLACK_UPDATE' })
    .pipe(takeUntil(this.unsubscribe))
    .subscribe(feature => {
      this.slackUpdate = feature?.status;
      this.slackSettings.updatable = this.slackUpdate;
    });
  }

  private updateRoute(): void {
    if (this.fetch) {
      this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
        `/dashboard/domain/${this.domainName}/${this.domainId}`);
    }
  }
  
}