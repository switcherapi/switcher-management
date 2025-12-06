import { Component, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../_helpers/toast.service';
import { ConsoleLogger } from '../_helpers/console-logger';
import { TeamService } from '../services/team.service';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-signup-team',
    templateUrl: './signup-team.component.html',
    styleUrls: ['./signup-team.component.css'],
    imports: [MatFormField, MatLabel, MatInput, MatButton]
})
export class SignupTeamComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly teamService = inject(TeamService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');
  readonly request = signal<string>('');
  readonly team = signal<string>('');
  readonly domain = signal<string>('');

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.request.set(params['request'] || '');
    
      if (this.request()) {
        this.loadInvite();
      }
    });
  }

  private loadInvite(): void {
    this.teamService.getInvitation(this.request()).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: invite => {
          if (invite) {
            this.team.set(invite.team);
            this.domain.set(invite.domain);
          }
          this.loading.set(false);
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.error.set(error.error);
          this.loading.set(false);
        }
      });
  }

  onAccept(): void {
    this.loading.set(true);

    this.teamService.acceptInvitation(this.request()).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: success => {
          if (success) {
            this.router.navigate(['/dashboard']);
            this.toastService.showSuccess(`Joined with success`);
          }
          this.loading.set(false);
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.error.set(error.error);
          this.loading.set(false);
        }
      });
  }

  onKey(_event: any): void {
    this.error.set('');
  }
}
