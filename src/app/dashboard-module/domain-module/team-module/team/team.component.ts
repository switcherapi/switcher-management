import { Component, OnInit, OnDestroy } from '@angular/core';
import { Team } from '../../model/team';
import { DomainRouteService } from '../../../services/domain-route.service';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { Types } from '../../model/path-route';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TeamService } from 'src/app/dashboard-module/services/team.service';
import { FormControl, Validators } from '@angular/forms';
import { ToastService } from 'src/app/_helpers/toast.service';
import { AdminService } from 'src/app/dashboard-module/services/admin.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: [
    '../../common/css/list.component.css',
    './team.component.css'
  ]
})
export class TeamComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  teamFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  teams: Team[];
  loading = false;
  error = '';

  updatable: boolean = true;
  removable: boolean = true;
  creatable: boolean = true;

  constructor(
    private adminService: AdminService,
    private teamService: TeamService,
    private domainRouteService : DomainRouteService,
    private errorHandler: RouterErrorHandler,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading = true;
    this.error = '';
    this.teamService.getTeamsByDomain(
      this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      this.readPermissionToObject(data);
      this.loading = false;
    }, error => {
      // this.error = this.errorHandler.doError(error);
      this.loading = false;
    });

    setTimeout(() => {
      if (!this.teams) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    }, environment.timeout);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  readPermissionToObject(teams: Team[]): void {
    const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.adminService.readCollabPermission(domain.id, ['CREATE', 'UPDATE', 'DELETE'], 'ADMIN', 'name', domain.name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'UPDATE') {
            this.updatable = element.result === 'ok' ? true : false;
          } else if (element.action === 'DELETE') {
            this.removable = element.result === 'ok' ? true : false;
          } else if (element.action === 'CREATE') {
            this.creatable = element.result === 'ok' ? true : false;
          }
        });

        if (teams) {
          this.teams = teams;
        }
      }
    });
  }

  createTeam() {
    const { valid } = this.teamFormControl;

    if (valid) {
      this.teamService.createTeam(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id, this.teamFormControl.value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(team => {
          if (team) {
            this.teams.push(team);
            this.toastService.showSuccess('Team created with success');
          }
        }, error => {
          this.toastService.showError(error.error);
        });
    } else {
      this.toastService.showError('Unable to create this team');
    }
  }

  removeTeamFromList(teamRemoved: Team): void {
    this.teams = this.teams.filter(team => team._id != teamRemoved._id);
  }

}
