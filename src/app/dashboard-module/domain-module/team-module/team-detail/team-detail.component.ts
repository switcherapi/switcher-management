import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Team } from '../../model/team';
import { map, takeUntil } from 'rxjs/operators';
import { Types } from '../../model/path-route';
import { DomainService } from 'src/app/dashboard-module/services/domain.service';
import { Domain } from '../../model/domain';
import { DomainRouteService } from 'src/app/dashboard-module/services/domain-route.service';
import { AdminService } from 'src/app/dashboard-module/services/admin.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatSlideToggleChange } from '@angular/material';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { TeamService } from 'src/app/dashboard-module/services/team.service';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: [
    '../../common/css/preview.component.css',
    '../../common/css/detail.component.css',
    './team-detail.component.css'
  ]
})
export class TeamDetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @BlockUI() blockUI: NgBlockUI;

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  domain: Domain;

  updatable: boolean = false;
  removable: boolean = false;
  creatable: boolean = false;

  loading: boolean = false;

  editing: boolean = false;
  classStatus: string;

  constructor(
    private domainRouteService: DomainRouteService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private team: Team,
    private domainService: DomainService,
    private teamService: TeamService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loading = true;
    this.route.paramMap.pipe(map(() => window.history.state)).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.team) {
        localStorage.setItem(Types.SELECTED_TEAM, data.team);
        this.readPermissionToObject(JSON.parse(data.team));
        this.loadDomain(this.team.domain);
      } else {
        this.readPermissionToObject(JSON.parse(localStorage.getItem(Types.SELECTED_TEAM)));
        this.loadDomain(this.team.domain);
      }
    })
  }

  loadDomain(domainId: string): void {
    this.nameFormControl.setValue(this.team.name);
    this.setHeaderStyle();
    this.domainService.getDomain(domainId).pipe(takeUntil(this.unsubscribe)).subscribe(domain => {
      if (domain) {
        this.domain = domain;
      }
    }, error => {
      ConsoleLogger.printError(error);
    }, () => {
      this.loading = false;
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  readPermissionToObject(team: Team): void {
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
      }
    });

    if (team) {
      this.team = team;
    }
  }

  getTeam(): Team {
    return this.team;
  }

  edit() {
    if (!this.editing) {
      this.editing = true;
      this.setHeaderStyle();
    } else {
      const { valid } = this.nameFormControl;

      if (valid) {
        this.editing = false;
        this.blockUI.start('Updating Team...');
        this.teamService.updateTeam(this.team._id, this.nameFormControl.value, this.team.active ? 'true' : 'false')
          .pipe(takeUntil(this.unsubscribe)).subscribe(team => {
            if (team) {
              this.team = team;
              this.setHeaderStyle();
              this.blockUI.stop();
              this.toastService.showSuccess(`Team updated with success`);
            }
        }, error => {
          this.blockUI.stop();
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to update team: '${this.team.name}'`);
        });
      }
    }
  }

  changeStatus(event: MatSlideToggleChange) {
    this.blockUI.start('Updating status...');
    this.teamService.updateTeam(this.team._id, this.team.name, event.checked ? 'true' : 'false')
      .pipe(takeUntil(this.unsubscribe)).subscribe(team => {
        if (team) {
          this.team = team;
          this.setHeaderStyle();
          this.blockUI.stop();
          this.toastService.showSuccess(`Team updated with success`);
        }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to update team: '${this.team.name}'`);
    });
  }

  removeTeam() {
    this.blockUI.start('Removing team...');
    this.teamService.deleteTeam(this.team._id).pipe(takeUntil(this.unsubscribe)).subscribe(team => {
        if (team) {
          this.blockUI.stop();
          this.router.navigate(['/dashboard/domain/team']);
          this.toastService.showSuccess(`Team removed with success`);
        }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to remove team: '${this.team.name}'`);
    })
  }

  setHeaderStyle(): void {
    if (this.editing) {
      this.classStatus = 'header editing';
    } else {
      this.classStatus = this.team.active ? 'header activated' : 'header deactivated';
    }
  }

}