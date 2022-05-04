import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map, takeUntil } from 'rxjs/operators';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormControl, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DetailComponent } from '../../common/detail-component';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { AdminService } from 'src/app/services/admin.service';
import { Team } from 'src/app/model/team';
import { DomainService } from 'src/app/services/domain.service';
import { TeamService } from 'src/app/services/team.service';
import { Types } from 'src/app/model/path-route';
import { Domain } from 'src/app/model/domain';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: [
    '../../common/css/preview.component.css',
    '../../common/css/detail.component.css',
    './team-detail.component.css'
  ]
})
export class TeamDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @BlockUI() blockUI: NgBlockUI;

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  domain: Domain;
  loading: boolean = false;

  constructor(
    private domainRouteService: DomainRouteService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private team: Team,
    private domainService: DomainService,
    private teamService: TeamService,
    private toastService: ToastService,
    private router: Router
  ) {
    super(adminService);
   }

  ngOnInit() {
    this.loading = true;
    this.route.paramMap.pipe(map(() => window.history.state)).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.team) {
        sessionStorage.setItem(Types.SELECTED_TEAM, data.team);
        this.team = JSON.parse(data.team);
        this.readPermissionToObject();
        this.loadDomain(this.team.domain);
      } else {
        this.team = JSON.parse(sessionStorage.getItem(Types.SELECTED_TEAM))
        this.readPermissionToObject();
        this.loadDomain(this.team.domain);
      }
    })
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
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

      if (super.validateEdition(
          { name: this.team.name }, 
          { name: this.nameFormControl.value })) {
        this.editing = false;
        this.setHeaderStyle();
        return;
      }

      if (valid) {
        this.editing = false;
        this.blockUI.start('Updating Team...');
        this.teamService.updateTeam(this.team._id, this.nameFormControl.value, this.team.active ? 'true' : 'false')
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(team => this.onSuccess(team), error => this.onError(error, `Unable to update team: '${this.team.name}'`));
      }
    }
  }

  changeStatus(event: MatSlideToggleChange) {
    this.blockUI.start('Updating status...');
    this.teamService.updateTeam(this.team._id, this.team.name, event.checked ? 'true' : 'false')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(team => this.onSuccess(team), error => this.onError(error, `Unable to update team: '${this.team.name}'`));
  }

  removeTeam() {
    this.blockUI.start('Removing team...');
    this.teamService.deleteTeam(this.team._id).pipe(takeUntil(this.unsubscribe)).subscribe(team => {
        if (team) {
          this.blockUI.stop();
          this.router.navigate(['/dashboard/domain/team']);
          this.toastService.showSuccess(`Team removed with success`);
        }
      }, error => this.onError(error, `Unable to remove team: '${this.team.name}'`));
  }

  private onSuccess(team: any): void {
    if (team) {
      this.team = team;
      this.setHeaderStyle();
      this.blockUI.stop();
      this.toastService.showSuccess(`Team updated with success`);
    }
  }

  private onError(error: any, message: string): void {
    this.blockUI.stop();
    ConsoleLogger.printError(error);
    this.toastService.showError(message);
  }

  private loadDomain(domainId: string): void {
    this.nameFormControl.setValue(this.team.name);
    this.setHeaderStyle();
    this.domainService.getDomain(domainId).pipe(takeUntil(this.unsubscribe)).subscribe(domain => {
      if (domain) {
        this.domain = domain;
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  private readPermissionToObject(): void {
    const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.adminService.readCollabPermission(domain.id, ['CREATE', 'UPDATE', 'DELETE'], 'ADMIN', 'name', domain.name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'UPDATE') {
            this.updatable = element.result === 'ok';
          } else if (element.action === 'DELETE') {
            this.removable = element.result === 'ok';
          } else if (element.action === 'CREATE') {
            this.creatable = element.result === 'ok';
          }
        });
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

}