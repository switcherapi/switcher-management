import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
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
export class SignupTeamComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly teamService = inject(TeamService);
  private readonly toastService = inject(ToastService);

  private readonly unsubscribe = new Subject<void>();

  loading = false;
  error = '';
  request: string;
  team: string;
  domain: string;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.request = params['request'];
    
      if (this.request) {
        this.loadInvite();
      }
    });
  }

  private loadInvite(): void {
    this.teamService.getInvitation(this.request).pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: invite => {
          if (invite) {
            this.team = invite.team;
            this.domain = invite.domain;
          }
          this.loading = false;
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.error = error.error;
          this.loading = false;
        }
      });
  }

  onAccept() {
    this.loading = true;

    this.teamService.acceptInvitation(this.request).pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: success => {
          if (success) {
            this.router.navigate(['/dashboard']);
            this.toastService.showSuccess(`Joined with success`);
          }
          this.loading = false;
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.error = error.error;
          this.loading = false;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onKey(_event: any) {
    this.error = '';
  }
}
