import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { Team } from 'src/app/model/team';
import { AdminService } from 'src/app/services/admin.service';
import { TeamService } from 'src/app/services/team.service';
import { ActivatedRoute } from '@angular/router';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: [
    '../../common/css/list.component.css',
    './team.component.css'
  ],
  standalone: false
})
export class TeamComponent implements OnInit, OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly domainRouteService = inject(DomainRouteService);
  private readonly adminService = inject(AdminService);
  private readonly teamService = inject(TeamService);
  private readonly toastService = inject(ToastService);

  private readonly unsubscribe = new Subject<void>();

  teamFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  domainId: string;
  domainName: string;
  teams: Team[];

  classStatus = "card mt-4 loading";
  creating = false;
  loading = false;
  error = '';
  fetch = true;

  readable = false;
  updatable = false;
  removable = false;
  creatable = false;

  constructor() { 
    this.activatedRoute.parent.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });

    this.activatedRoute.paramMap
      .pipe(map(() => window.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.fetch = data.navigationId === 1);
  }

  ngOnInit() {
    this.loadTeams();
    this.updateRoute();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  createTeam() {
    const { valid } = this.teamFormControl;

    if (valid) {
      const teamName = this.teamFormControl.value;
      this.teamFormControl.reset();
      this.creating = true;

      this.teamService.createTeam(this.domainId, teamName)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: team => {
            if (team) {
              this.teams.push(team);
              this.toastService.showSuccess('Team created with success');
            }
          },
          error: error => {
            this.toastService.showError(error.error);
            ConsoleLogger.printError(error);
          },
          complete: () => {
            this.creating = false;
          }
        });
    } else {
      this.toastService.showError('Unable to create this team');
    }
  }

  removeTeamFromList(teamRemoved: Team): void {
    this.teams = this.teams.filter(team => team._id != teamRemoved._id);
  }
  
  private loadTeams(): void {
    this.loading = true;
    this.error = '';
    this.readPermissionToObject();
    this.teamService.getTeamsByDomain(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.teams = data;
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.classStatus = "card mt-4 ready";
          if (!this.teams)
            this.error = 'Failed to connect to Switcher API';
        }
      });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['READ', 'CREATE', 'UPDATE', 'DELETE'], 'ADMIN')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          data.forEach(element => {
            if (element.action === 'UPDATE') {
              this.updatable = element.result === 'ok';
            } else if (element.action === 'DELETE') {
              this.removable = element.result === 'ok';
            } else if (element.action === 'CREATE') {
              this.creatable = element.result === 'ok';
            } else if (element.action === 'READ') {
              this.readable = element.result === 'ok';
            } 
          });
        }
    });
  }

  private updateRoute(): void {
    this.domainRouteService.updateView('Teams', 6);

    if (this.fetch) {
      this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
        `/dashboard/domain/${this.domainName}/${this.domainId}`);
    }
  }

}
