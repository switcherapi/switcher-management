import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map, takeUntil } from 'rxjs/operators';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material/slide-toggle';
import { DetailComponent } from '../../common/detail-component';
import { AdminService } from 'src/app/services/admin.service';
import { Team } from 'src/app/model/team';
import { TeamService } from 'src/app/services/team.service';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';
import { NgClass, NgStyle } from '@angular/common';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgbNav, NgbNavItem, NgbNavLink, NgbNavLinkBase, NgbNavContent, NgbNavOutlet } from '@ng-bootstrap/ng-bootstrap';
import { TeamMembersComponent } from '../team-members/team-members.component';
import { TeamPermissionsComponent } from '../team-permissions/team-permissions.component';
import { TeamPendingMembersComponent } from '../team-pending-members/team-pending-members.component';
import { BlockUIComponent } from 'src/app/shared/block-ui/block-ui.component';

@Component({
    selector: 'app-team-detail',
    templateUrl: './team-detail.component.html',
    styleUrls: [
        '../../common/css/preview.component.css',
        '../../common/css/detail.component.css',
        './team-detail.component.css'
    ],
    imports: [NgClass, MatFormField, MatLabel, MatInput, FormsModule, NgStyle, ReactiveFormsModule, MatError, MatSlideToggle, 
      MatButton, MatIcon, NgbNav, NgbNavItem, NgbNavLink, NgbNavLinkBase, NgbNavContent, TeamMembersComponent, 
      TeamPermissionsComponent, TeamPendingMembersComponent, NgbNavOutlet, BlockUIComponent
    ]
})
export class TeamDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private readonly domainRouteService = inject(DomainRouteService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly teamService = inject(TeamService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  private readonly unsubscribe = new Subject<void>();

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  domainId: string;
  domainName: string;
  teamId: string;
  team = signal<Team | undefined>(undefined);
  teamLoading = signal(false);

  // Signal versions of permission properties
  teamUpdatable = signal(false);
  teamRemovable = signal(false);
  teamCreatable = signal(false);

  constructor() {
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
    this.teamLoading.set(true);
    this.readPermissionToObject();
    this.activatedRoute.paramMap.pipe(map(() => globalThis.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        this.updateRoute(data.navigationId === 1);

        if (data.team) {
          const parsedTeam = JSON.parse(data.team);
          this.team.set(parsedTeam);
          this.nameFormControl.setValue(parsedTeam.name);
          this.setHeaderStyle();
          this.teamLoading.set(false);
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
    if (!this.editing()) {
      this.editing.set(true);
      this.setHeaderStyle();
      return;
    }
    
    const { valid } = this.nameFormControl;

    const currentTeam = this.team();
    if (!currentTeam) return;

    if (super.validateEdition(
        { name: currentTeam.name }, 
        { name: this.nameFormControl.value })) {
      this.editing.set(false);
      this.setHeaderStyle();
      return;
    }

    if (valid) {
      this.editing.set(false);
      this.setBlockUI(true, 'Updating Team...');
      this.teamService.updateTeam(currentTeam._id, this.nameFormControl.value, currentTeam.active ? 'true' : 'false')
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: team => this.onSuccess(team),
          error: error => this.onError(error, `Unable to update team: '${currentTeam.name}'`)
        });
    }
  }

  changeStatus(event: MatSlideToggleChange) {
    const currentTeam = this.team();
    if (!currentTeam) return;
    
    this.setBlockUI(true, 'Updating status...');
    this.teamService.updateTeam(currentTeam._id, currentTeam.name, event.checked ? 'true' : 'false')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: team => this.onSuccess(team),
        error: error => this.onError(error, `Unable to update team: '${currentTeam.name}'`)
      });
  }

  removeTeam() {
    const currentTeam = this.team();
    if (!currentTeam) return;
    
    this.setBlockUI(true, 'Removing team...');
    this.teamService.deleteTeam(currentTeam._id).pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: team => {
          if (team) {
            this.setBlockUI(false);
            this.router.navigate([`/dashboard/domain/${encodeURIComponent(this.domainName)}/${this.domainId}/teams`]);
            this.toastService.showSuccess('Team removed with success');
          }
        },
        error: error => this.onError(error, `Unable to remove team: '${currentTeam.name}'`)
      });
  }

  private onSuccess(team: any): void {
    if (team) {
      this.team.set(team);
      this.setHeaderStyle();
      this.setBlockUI(false);
      this.toastService.showSuccess('Team updated with success');
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
            this.team.set(team);
            this.nameFormControl.setValue(team.name);
            this.setHeaderStyle();
            this.teamLoading.set(false);
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.teamLoading.set(false);
        }
      });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['CREATE', 'UPDATE', 'DELETE'], 'ADMIN')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          this.teamUpdatable.set(data.find(permission => permission.action === 'UPDATE')?.result === 'ok');
          this.teamRemovable.set(data.find(permission => permission.action === 'DELETE')?.result === 'ok');
          this.teamCreatable.set(data.find(permission => permission.action === 'CREATE')?.result === 'ok');
        }
    });
  }

  private setHeaderStyle(): void {
    const currentTeam = this.team();
    if (this.editing()) {
      this.classStatus.set('header editing');
    } else {
      this.classStatus.set(currentTeam?.active ? 'header activated' : 'header deactivated');
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