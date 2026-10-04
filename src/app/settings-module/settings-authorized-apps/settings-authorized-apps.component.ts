import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { ToastService } from 'src/app/_helpers/toast.service';
import { AuthorizedApp } from 'src/app/model/authorized-app';
import { OAuthService } from 'src/app/services/oauth.service';
import { BlockUIComponent } from '../../shared/block-ui/block-ui.component';

@Component({
    selector: 'app-settings-authorized-apps',
    templateUrl: './settings-authorized-apps.component.html',
    styleUrls: [
        '../../dashboard-module/domain-module/common/css/detail.component.css',
        './settings-authorized-apps.component.css'
    ],
    imports: [BlockUIComponent, MatButton, MatIcon, DatePipe]
})
export class AuthorizedAppsComponent {
  private readonly oauthService = inject(OAuthService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private readonly destroyRef = inject(DestroyRef);

  readonly authorizedApps = signal<AuthorizedApp[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly comingSoon = signal(false);
  readonly blockUiMessage = signal('Loading authorized applications...');

  constructor() {
    this.loadAuthorizedApps();
  }

  onRevoke(app: AuthorizedApp): void {
    const modalConfirmation = this.modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Revoking application access';
    modalConfirmation.componentInstance.question = `Are you sure you want to revoke access for ${this.getClientLabel(app)}?`;
    modalConfirmation.result.then(result => {
      if (result) {
        this.revokeApp(app);
      }
    }, () => {});
  }

  getClientLabel(app: AuthorizedApp): string {
    return app.client_name || app.client_id;
  }

  private loadAuthorizedApps(): void {
    this.loading.set(true);
    this.error.set('');

    this.oauthService.getAuthorizedApps()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.authorizedApps.set(data ?? []);
          this.comingSoon.set(false);
          this.loading.set(false);
        },
        error: error => {
          if (error?.status === 404) {
            ConsoleLogger.printInfo('Authorized apps endpoints are not implemented yet in switcher-api', error);
            this.authorizedApps.set([]);
            this.comingSoon.set(true);
          } else {
            ConsoleLogger.printError(error);
            this.error.set('Unable to load authorized applications');
            this.toastService.showError('Unable to load authorized applications');
          }

          this.loading.set(false);
        }
      });
  }

  private revokeApp(app: AuthorizedApp): void {
    this.blockUiMessage.set('Revoking application access...');
    this.loading.set(true);

    this.oauthService.revokeApp(app.client_id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.authorizedApps.set(this.authorizedApps().filter(currentApp => currentApp.client_id !== app.client_id));
          this.toastService.showSuccess(`Access revoked for ${this.getClientLabel(app)}`);
          this.blockUiMessage.set('Loading authorized applications...');
          this.loading.set(false);
        },
        error: error => {
          if (error?.status === 404) {
            ConsoleLogger.printInfo('OAuth revoke endpoint is not implemented yet in switcher-api', error);
            this.authorizedApps.set([]);
            this.comingSoon.set(true);
            this.error.set('');
          } else {
            ConsoleLogger.printError(error);
            this.toastService.showError('Unable to revoke authorized application');
          }

          this.blockUiMessage.set('Loading authorized applications...');
          this.loading.set(false);
        }
      });
  }
}
