import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { Team } from 'src/app/model/team';
import { AdminService } from 'src/app/services/admin.service';
import { TeamService } from 'src/app/services/team.service';
import { ActivatedRoute } from '@angular/router';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';
import { NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { TeamPreviewComponent } from '../team-preview/team-preview.component';

@Component({
    selector: 'app-team',
    templateUrl: './team.component.html',
    styleUrls: [
        '../../common/css/list.component.css',
        './team.component.css'
    ],
    imports: [NgClass, MatButton, MatIcon, MatProgressSpinner, MatFormField, MatLabel, MatInput, FormsModule, ReactiveFormsModule, TeamPreviewComponent]
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
  teams = signal<Team[]>([]);

  classStatus = signal("card mt-4 loading");
  creating = signal(false);
  loading = signal(false);
  error = signal('');
  fetch = true;

  readable = signal(false);
  updatable = signal(false);
  removable = signal(false);
  creatable = signal(false);

  constructor() { 
    this.activatedRoute.parent.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });

    this.activatedRoute.paramMap
      .pipe(map(() => globalThis.history.state))
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
      this.creating.set(true);

      this.teamService.createTeam(this.domainId, teamName)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: team => {
            if (team) {
              const currentTeams = this.teams();
              this.teams.set([...currentTeams, team]);
              this.toastService.showSuccess('Team created with success');
            }
          },
          error: error => {
            this.creating.set(false);
            this.toastService.showError(error.error);
            ConsoleLogger.printError(error);
          },
          complete: () => {
            this.creating.set(false);
          }
        });
    } else {
      this.toastService.showError('Unable to create this team');
    }
  }

  removeTeamFromList(teamRemoved: Team): void {
    if (!teamRemoved?._id) {
      return;
    }
    
    const currentTeams = this.teams();
    const updatedTeams = currentTeams.filter(team => team._id !== teamRemoved._id);
    this.teams.set(updatedTeams);
  }
  
  private loadTeams(): void {
    this.loading.set(true);
    this.error.set('');
    this.readPermissionToObject();
    this.teamService.getTeamsByDomain(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.teams.set(data);
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
          this.classStatus.set("card mt-4 ready");
          const currentTeams = this.teams();
          
          if (!currentTeams || currentTeams.length === 0) {
            this.error.set('Failed to connect to Switcher API');
          }
        }
      });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['READ', 'CREATE', 'UPDATE', 'DELETE'], 'ADMIN')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          for (const element of data) {
            if (element.action === 'UPDATE') {
              this.updatable.set(element.result === 'ok');
            } else if (element.action === 'DELETE') {
              this.removable.set(element.result === 'ok');
            } else if (element.action === 'CREATE') {
              this.creatable.set(element.result === 'ok');
            } else if (element.action === 'READ') {
              this.readable.set(element.result === 'ok');
            } 
          }
        }
    });
  }

  private updateRoute(): void {
    this.domainRouteService.updateView('Teams', 6);

    if (this.fetch) {
      this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
        `/dashboard/domain/${this.domainName}/${this.domainId}`);
    } else {
      this.domainRouteService.refreshPath();
    }
  }

}
