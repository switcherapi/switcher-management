import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from '../_helpers/toast.service';
import { ConsoleLogger } from '../_helpers/console-logger';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-signup-team',
  templateUrl: './signup-team.component.html',
  styleUrls: ['./signup-team.component.css'],
  standalone: false
})
export class SignupTeamComponent implements OnInit, OnDestroy {
  private readonly unsubscribe = new Subject<void>();

  loading = false;
  error = '';
  request: string;
  team: string;
  domain: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly teamService: TeamService,
    private readonly toastService: ToastService
  ) { }

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
