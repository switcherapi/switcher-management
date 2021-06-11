import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Domain } from '../model/domain';
import { Types } from '../model/path-route';
import { SlackInstallation } from '../model/slack';
import { DomainRouteService } from '../services/domain-route.service';
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
  
  selectedDomain: Domain;
  installation: SlackInstallation;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private slackService: SlackService,
    private domainRouteService: DomainRouteService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    const routeDomain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);

    this.route.queryParams.subscribe(params => {
      this.enterprise_id = params['e_id'] || '';
      this.team_id = params['t_id'] || '';
      this.selectedDomain = routeDomain?.element;

      if (!(this.error = this.validate(params['error'], params['reason'])))
        this.loadSlackInstallation();
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private loadSlackInstallation(): void {
    this.loading = true;
    this.slackService.findSlackInstallation(this.enterprise_id, this.team_id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(installation => {
        this.installation = installation;
        this.loading = false;
      }, error => {
        ConsoleLogger.printError(error);
        this.error = 'Unable to load Slack Installation';
        this.loading = false;
      });
  }

  private validate(responseCode: number, responseReason: string): string {
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
      .subscribe(() => {
        this.toastService.showSuccess(`Slack App succesfully installed for ${this.selectedDomain.name}`);
        this.router.navigate(['/dashboard']);
      }, error => {
        ConsoleLogger.printError(error);
        this.toastService.showError(`Unable to complete the Slack installation`);
        this.loading = false;
      });
  }

  onDecline(): void {
    this.loading = true;
    this.slackService.declineInstallation(this.enterprise_id, this.team_id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.router.navigate(['/dashboard']);
      }, error => {
        ConsoleLogger.printError(error);
        this.toastService.showError(`Unable to decline Slack installation`);
        this.loading = false;
      });
  }

}
