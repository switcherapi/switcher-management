import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map, takeUntil } from 'rxjs/operators';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormControl, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DetailComponent } from '../../common/detail-component';
import { AdminService } from 'src/app/services/admin.service';
import { Team } from 'src/app/model/team';
import { TeamService } from 'src/app/services/team.service';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: [
    '../../common/css/preview.component.css',
    '../../common/css/detail.component.css',
    './team-detail.component.css'
  ],
  standalone: false
})
export class TeamDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private readonly unsubscribe = new Subject<void>();

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  domainId: string;
  domainName: string;
  teamId: string;
  team: Team;
  loading = false;

  constructor(
    private readonly adminService: AdminService,
    private readonly domainRouteService: DomainRouteService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly teamService: TeamService,
    private readonly toastService: ToastService,
    private readonly router: Router
  ) {
    super();
    this.activatedRoute.parent.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });

    this.activatedRoute.params.subscribe(params => {
      this.teamId = params.teamid;
    });
   }

  ngOnInit() {
    this.loading = true;
    this.readPermissionToObject();
    this.activatedRoute.paramMap.pipe(map(() => window.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        this.updateRoute(data.navigationId === 1);

        if (data.team) {
          this.team = JSON.parse(data.team);
          this.nameFormControl.setValue(this.team.name);
          this.setHeaderStyle();
          this.loading = false;
        } else {
          this.loadTeam();
        }
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  edit() {
    if (!this.editing) {
      this.editing = true;
      this.setHeaderStyle();
    } else {
      const { valid } = this.nameFormControl;

      if (super.validateEdition(
          { name: this.team.name }, 
          { name: this.nameFormControl.value })) {
        this.editing = false;
        this.setHeaderStyle();
        return;
      }

      if (valid) {
        this.editing = false;
        this.setBlockUI(true, 'Updating Team...');
        this.teamService.updateTeam(this.team._id, this.nameFormControl.value, this.team.active ? 'true' : 'false')
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: team => this.onSuccess(team),
            error: error => this.onError(error, `Unable to update team: '${this.team.name}'`)
          });
      }
    }
  }

  changeStatus(event: MatSlideToggleChange) {
    this.setBlockUI(true, 'Updating status...');
    this.teamService.updateTeam(this.team._id, this.team.name, event.checked ? 'true' : 'false')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: team => this.onSuccess(team),
        error: error => this.onError(error, `Unable to update team: '${this.team.name}'`)
      });
  }

  removeTeam() {
    this.setBlockUI(true, 'Removing team...');
    this.teamService.deleteTeam(this.team._id).pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: team => {
          if (team) {
            this.setBlockUI(false);
            this.router.navigate([`/dashboard/domain/${encodeURIComponent(this.domainName)}/${this.domainId}/teams`]);
            this.toastService.showSuccess(`Team removed with success`);
          }
        },
        error: error => this.onError(error, `Unable to remove team: '${this.team.name}'`)
      });
  }

  private onSuccess(team: any): void {
    if (team) {
      this.team = team;
      this.setHeaderStyle();
      this.setBlockUI(false);
      this.toastService.showSuccess(`Team updated with success`);
    }
  }

  private onError(error: any, message: string): void {
    this.setBlockUI(false);
    ConsoleLogger.printError(error);
    this.toastService.showError(message);
  }

  private loadTeam(): void {
    this.teamService.getTeam(this.teamId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: team => {
          if (team) {
            this.team = team;
            this.nameFormControl.setValue(this.team.name);
            this.setHeaderStyle();
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['CREATE', 'UPDATE', 'DELETE'], 'ADMIN')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          this.updatable = data.find(permission => permission.action === 'UPDATE').result === 'ok';
          this.removable = data.find(permission => permission.action === 'DELETE').result === 'ok';
          this.creatable = data.find(permission => permission.action === 'CREATE').result === 'ok';
        }
    });
  }

  private setHeaderStyle(): void {
    if (this.editing) {
      this.classStatus = 'header editing';
    } else {
      this.classStatus = this.team.active ? 'header activated' : 'header deactivated';
    }
  }

  private updateRoute(updateBreadcrumbs: boolean): void {
    this.domainRouteService.updateView('Teams', 6);

    if (updateBreadcrumbs) {
      this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
        `/dashboard/domain/${this.domainName}/${this.domainId}`);
    }
  }

}