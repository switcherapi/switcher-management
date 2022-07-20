import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { Team } from 'src/app/model/team';
import { AdminService } from 'src/app/services/admin.service';
import { TeamService } from 'src/app/services/team.service';
import { ActivatedRoute } from '@angular/router';
import { DomainRouteService } from 'src/app/services/domain-route.service';

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

  domainId: string;
  domainName: string;
  teams: Team[];
  loading = false;
  error = '';

  readable: boolean = false;
  updatable: boolean = false;
  removable: boolean = false;
  creatable: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private domainRouteService: DomainRouteService,
    private adminService: AdminService,
    private teamService: TeamService,
    private toastService: ToastService
  ) { 
    this.activatedRoute.parent.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });
  }

  ngOnInit() {
    this.loadTeams();
    this.domainRouteService.updateView('Teams', 6);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  createTeam() {
    const { valid } = this.teamFormControl;

    if (valid) {
      this.loading = true;
      this.teamService.createTeam(this.domainId, this.teamFormControl.value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(team => {
          if (team) {
            this.teams.push(team);
            this.toastService.showSuccess('Team created with success');
          }
        }, error => {
          this.loading = false;
          this.toastService.showError(error.error);
        }, () => {
          this.loading = false;
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
      .subscribe(data => {
        if (data) {
          this.teams = data;
        }
    }, error => {
      ConsoleLogger.printError(error);
      this.loading = false;
    }, () => {
      this.loading = false;
      if (!this.teams)
        this.error = 'Failed to connect to Switcher API';
    });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['READ', 'CREATE', 'UPDATE', 'DELETE'], 'ADMIN', 'name', this.domainName)
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

}
