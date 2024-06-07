import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Domain } from '../model/domain';
import { SlackInstallation } from '../model/slack';
import { DomainService } from '../services/domain.service';
import { SlackService } from '../services/slack.service';
import { ConsoleLogger } from '../_helpers/console-logger';
import { ToastService } from '../_helpers/toast.service';

@Component({
  selector: 'app-slack-auth',
  templateUrl: './slack-auth.component.html',
  styleUrls: ['./slack-auth.component.css']
})
export class SlackAuthComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  private enterprise_id: string;
  private team_id: string;

  domainFormControl = new FormControl(undefined);
  
  domains: Domain[];
  selectedDomain: Domain;
  installation: SlackInstallation;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private domainService: DomainService,
    private slackService: SlackService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.enterprise_id = params['e_id'] || '';
      this.team_id = params['t_id'] || '';
      this.error = this.validate(params['error'], params['reason']);

      this.loadDomains();
    });

    this.domainFormControl.valueChanges.subscribe(value => {
      this.selectedDomain = value;
      this.error = this.validate();
      if (!this.error)
        this.loadSlackInstallation();
    })
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private loadDomains() {
    this.domainService.getDomains()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.domains = data.filter(domain => !domain.integrations.slack);
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to load Domains`);
        }
      });
  }

  private loadSlackInstallation(): void {
    this.loading = true;
    this.slackService.findSlackInstallation(this.enterprise_id, this.team_id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: installation => {
          this.installation = installation;
          this.loading = false;
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.error = 'Unable to load Slack Installation';
          this.loading = false;
        }
      });
  }

  private validate(responseCode?: number, responseReason?: string): string {
    if (responseCode == 1) {
      ConsoleLogger.printError(responseReason);
      return 'Unable to proceed with the Slack installation, try it again';
    }

    if (!this.selectedDomain)
      return 'Please, select a Domain to proceed with the Slack installation';

    if (!this.enterprise_id && !this.team_id)
      return 'Unable to load Slack Authorization from the given URL';
  }

  onAuthorize(): void {
    this.loading = true;
    this.slackService.authorizeInstallation(this.selectedDomain.id, this.team_id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: _ => {
          this.toastService.showSuccess(`Slack App succesfully installed for ${this.selectedDomain.name}`);
          this.router.navigate(['/dashboard']);
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to complete the Slack installation`);
          this.loading = false;
        }
      });
  }

  onDecline(): void {
    this.loading = true;
    this.slackService.declineInstallation(this.enterprise_id, this.team_id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: _ => {
          this.router.navigate(['/dashboard']);
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to decline Slack installation`);
          this.loading = false;
        }
      });
  }

}
