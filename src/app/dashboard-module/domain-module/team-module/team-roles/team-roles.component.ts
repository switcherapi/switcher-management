import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { Team } from '../../model/team';
import { MatSort, MatPaginator, MatTableDataSource, MatDialog } from '@angular/material';
import { TeamService } from 'src/app/dashboard-module/services/team.service';
import { ToastService } from 'src/app/_helpers/toast.service';
import { takeUntil } from 'rxjs/operators';
import { Role } from '../../model/role';
import { RoleService } from 'src/app/dashboard-module/services/role.service';
import { TeamRoleCreateComponent } from '../team-role-create/team-role-create.component';

@Component({
  selector: 'app-team-roles',
  templateUrl: './team-roles.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    './team-roles.component.css'
  ]
})
export class TeamRolesComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  @Input() team: Team;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  dataSource: MatTableDataSource<Role>;
  dataColumns = ['remove', 'edit', 'router', 'action'];

  constructor(
    private teamService: TeamService,
    private roleService: RoleService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadRoles();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadRoles(): void {
    this.roleService.getRolesByTeam(this.team._id).pipe(takeUntil(this.unsubscribe)).subscribe(roles => {
      if (roles) {
        this.loadDataSource(roles)
      }
    }, error => {
      console.log(error);
    });
  }

  loadDataSource(data: Role[]): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editRole(role: Role) {
    const dialogRef = this.dialog.open(TeamRoleCreateComponent, {
      width: '400px',
      data: { 
        roles: this.dataSource.data,
        router: role.router,
        action: role.action,
        values: role.values,
        identifiedBy: role.identifiedBy,
        role
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roleService.updateRole(this.team._id, result.action, result.router, result.identifiedBy)
          .pipe(takeUntil(this.unsubscribe)).subscribe(role => {
            if (role) {
              this.loadRoles();
              this.toastService.showSuccess('Role updated with success');
            }
          });
      }
    });
  }

  removeRole(role: Role) {
    this.roleService.deleteRole(role._id).pipe(takeUntil(this.unsubscribe)).subscribe(role => {
      if (role) {
        this.loadRoles();
        this.toastService.showSuccess('Role removed with success');
      }
    }, error => {
      console.log(error);
    });
  }

  createRole() {
    const dialogRef = this.dialog.open(TeamRoleCreateComponent, {
      width: '400px',
      data: { 
        roles: this.dataSource.data,
        values: []
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roleService.createRole(this.team._id, result.action, result.router, result.identifiedBy, result.values)
          .pipe(takeUntil(this.unsubscribe)).subscribe(role => {
            if (role) {
              this.loadRoles();
              this.toastService.showSuccess('Role created with success');
            }
          });
      }
    });
  }

}
