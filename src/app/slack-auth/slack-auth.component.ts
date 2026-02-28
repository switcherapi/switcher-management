import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Domain } from '../model/domain';
import { SlackInstallation } from '../model/slack';
import { DomainService } from '../services/domain.service';
import { SlackService } from '../services/slack.service';
import { ConsoleLogger } from '../_helpers/console-logger';
import { ToastService } from '../_helpers/toast.service';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-slack-auth',
    templateUrl: './slack-auth.component.html',
    styleUrls: ['./slack-auth.component.css'],
    imports: [MatFormField, MatLabel, MatSelect, FormsModule, ReactiveFormsModule, MatOption, MatInput, MatButton, MatIcon]
})
export class SlackAuthComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly domainService = inject(DomainService);
  private readonly slackService = inject(SlackService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly enterpriseId = signal<string>('');
  private readonly teamId = signal<string>('');

  readonly domainFormControl = new FormControl<Domain | undefined>(undefined);
  
  readonly domains = signal<Domain[]>([]);
  readonly selectedDomain = signal<Domain | undefined>(undefined);
  readonly installation = signal<SlackInstallation | undefined>(undefined);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');

  readonly validationError = computed(() => {
    const selectedDomain = this.selectedDomain();
    const enterpriseId = this.enterpriseId();
    const teamId = this.teamId();

    if (!selectedDomain) {
      return 'Please, select a Domain to proceed with the Slack installation';
    }

    if (!enterpriseId && !teamId) {
      return 'Unable to load Slack Authorization from the given URL';
    }

    return '';
  });

  constructor() {
    // Initialize query params subscription
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.enterpriseId.set(params['e_id'] ?? '');
      this.teamId.set(params['t_id'] ?? '');
      
      const validationError = this.validate(params['error'], params['reason']);
      this.error.set(validationError);

      this.loadDomains();
    });

    // Form control value changes subscription
    this.domainFormControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.selectedDomain.set(value);
      const validationError = this.validationError();
      this.error.set(validationError);
      
      if (!validationError && value) {
        this.loadSlackInstallation();
      }
    });
  }

  private loadDomains(): void {
    this.domainService.getDomains()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          if (data) {
            this.domains.set(data.filter(domain => !domain.integrations.slack));
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.toastService.showError('Unable to load Domains');
        }
      });
  }

  private loadSlackInstallation(): void {
    this.loading.set(true);
    this.slackService.findSlackInstallation(this.enterpriseId(), this.teamId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: installation => {
          this.installation.set(installation);
          this.loading.set(false);
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.error.set('Unable to load Slack Installation');
          this.loading.set(false);
        }
      });
  }

  private validate(responseCode?: number, responseReason?: string): string {
    if (responseCode === 1) {
      ConsoleLogger.printError(responseReason);
      return 'Unable to proceed with the Slack installation, try it again';
    }
    return '';
  }

  onAuthorize(): void {
    this.loading.set(true);
    const selectedDomain = this.selectedDomain();
    if (!selectedDomain) return;
    
    this.slackService.authorizeInstallation(selectedDomain.id, this.teamId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.showSuccess(`Slack App succesfully installed for ${selectedDomain.name}`);
          this.router.navigate(['/dashboard']);
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.toastService.showError('Unable to complete the Slack installation');
          this.loading.set(false);
        }
      });
  }

  onDecline(): void {
    this.loading.set(true);
    this.slackService.declineInstallation(this.enterpriseId(), this.teamId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.toastService.showError('Unable to decline Slack installation');
          this.loading.set(false);
        }
      });
  }

}
