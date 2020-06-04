import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { TeamService } from '../dashboard-module/services/team.service';
import { ToastService } from '../_helpers/toast.service';
import { ConsoleLogger } from '../_helpers/console-logger';

@Component({
  selector: 'app-signup-team',
  templateUrl: './signup-team.component.html',
  styleUrls: ['./signup-team.component.css']
})
export class SignupTeamComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  loading = false;
  error = '';
  request: string;
  team: string;
  domain: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private toastService: ToastService
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
    this.teamService.getInvitation(this.request).pipe(takeUntil(this.unsubscribe)).subscribe(invite => {
      console.log(invite)
      if (invite) {
        this.team = invite.team;
        this.domain = invite.domain;
      }
      this.loading = false;
    }, error => {
      ConsoleLogger.printError(error);
      this.error = error.error;
      this.loading = false;
    }
  );
  }

  onAccept() {
    this.loading = true;

    this.teamService.acceptInvitation(this.request).pipe(takeUntil(this.unsubscribe)).subscribe(success => {
        if (success) {
          this.router.navigate(['/dashboard']);
          this.toastService.showSuccess(`Joined with success`);
        }
        this.loading = false;
      }, error => {
        ConsoleLogger.printError(error);
        this.error = error.error;
        this.loading = false;
      }
    );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onKey(event: any) {
    this.error = '';
  }
}
