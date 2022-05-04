import { OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Domain } from 'src/app/model/domain';
import { Types } from 'src/app/model/path-route';
import { FEATURES, Slack } from 'src/app/model/slack';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { SlackService } from 'src/app/services/slack.service';
import { NgbdModalConfirm } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { ToastService } from 'src/app/_helpers/toast.service';

@Component({
  selector: 'app-ext-slack',
  templateUrl: './ext-slack.component.html',
  styleUrls: [
    '../common/css/detail.component.css', 
    './ext-slack.component.css'
  ]
})
export class ExtSlackComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  
  private domain: Domain;
  slackUpdate: boolean = false;
  loading: boolean = true;
  slack: Slack;

  formQtyApprovals = new FormControl({ value: 1, disabled: true }, [
    Validators.max(50), 
    Validators.min(0)
  ]);

  constructor(
    private domainRouteService: DomainRouteService,
    private slackService: SlackService,
    private toastService: ToastService,
    private router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadSlack();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onUpdate(): void {
    const { valid } = this.formQtyApprovals;

    if (valid)
      console.log('Updating approvals to: ', this.slack.settings.approvals);
  }

  onUninstall(): void {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Slack Uninstall';
    modalConfirmation.componentInstance.question = 'Are you sure you want to uninstall Slack?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.slackService.unlinkInstallation(this.domain.id)
          .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            if (data) {
              this.router.navigate(['/dashboard']);
              this.toastService.showSuccess(data.message);
            }
          }, (error) => {
            ConsoleLogger.printError(error);
            this.toastService.showError('Unable to uninstall Slack');
          });
      }
    });
  }

  onResetTicketsHistory(): void {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Reset Ticket History';
    modalConfirmation.componentInstance.question = 'Are you sure you want to delete all tickets?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.slackService.resetTickets(this.slack.team_id)
          .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            if (data) {
              this.toastService.showSuccess(data.message);
              this.slack.tickets_approved = 0;
              this.slack.tickets_denied = 0;
              this.slack.tickets_opened = 0;
            }
          }, (error) => {
            ConsoleLogger.printError(error);
            this.toastService.showError('Unable to reset tickets');
          });
      }
    });
  }

  private loadSlack(): void {
    this.loading = true;

    this.domain = this.domainRouteService.getPathElement(
      Types.SELECTED_DOMAIN).element;

    this.slackService.getSlackInstallation(this.domain.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(slack => {
        this.slack = slack;
        this.loadSlackAvailability();
    }, (error) => {
      ConsoleLogger.printError(error);
      this.toastService.showError('Unable to display Slack Integrations properties');
    }, () => {
      this.loading = false;
    });
  }

  private loadSlackAvailability(): void {
    this.slackService.getSlackAvailability(FEATURES.SLACK_UPDATE)
    .pipe(takeUntil(this.unsubscribe))
    .subscribe(data => {
      this.slackUpdate = data?.result;
      if (this.slackUpdate)
        this.formQtyApprovals.enable({ onlySelf: true });
    });
  }

}