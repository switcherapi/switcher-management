import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { Team } from 'src/app/model/team';
import { AdminService } from 'src/app/services/admin.service';
import { TeamService } from 'src/app/services/team.service';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';

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

  readable: boolean = false;
  updatable: boolean = false;
  removable: boolean = false;
  creatable: boolean = false;

  constructor(
    private adminService: AdminService,
    private teamService: TeamService,
    private domainRouteService : DomainRouteService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading = true;
    this.error = '';
    this.readPermissionToObject();
    this.teamService.getTeamsByDomain(
      this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      
      if (data) {
        this.teams = data;
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.loading = false;
    }, () => {
      if (!this.teams) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  readPermissionToObject(): void {
    const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.adminService.readCollabPermission(domain.id, ['READ', 'CREATE', 'UPDATE', 'DELETE'], 'ADMIN', 'name', domain.name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'UPDATE') {
            this.updatable = element.result === 'ok' ? true : false;
          } else if (element.action === 'DELETE') {
            this.removable = element.result === 'ok' ? true : false;
          } else if (element.action === 'CREATE') {
            this.creatable = element.result === 'ok' ? true : false;
          } else if (element.action === 'READ') {
            this.readable = element.result === 'ok' ? true : false;
          } 
        });
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
